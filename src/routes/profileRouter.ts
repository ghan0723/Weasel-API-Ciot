import UserService from "../service/userService";
import ProfileService from "../service/profileService";
import express, { Request, Response, Router } from "express";
import CryptoService from "../service/cryptoService";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const profileService: ProfileService = new ProfileService();
const userService: UserService = new UserService();
const cryptoService = new CryptoService("sn0ISmjyz1CWT6Yb7dxu");

router.get("/edit/:username", (req: Request, res: Response) => {
  let username = req.params.username;
  profileService
    .getProfile(username)
    .then((user) => {
      const decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
      const newUser = {
        username: user[0].username,
        passwd: decPasswd,
        privilege: user[0].privilege,
        ip_ranges: user[0].ip_ranges,
        pwd_change_freq: user[0].pwd_change_freq,
      };
      weasel.log(
        username,
        req.socket.remoteAddress,
        "Verified the profile page"
      );
      res.send([newUser]);
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed to retrieve the profile page"
      );
      console.error("profile failed:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/update/:username", (req: Request, res: Response) => {
  let oldname = req.params.username;
  let user = req.body;
  const encPasswd = cryptoService.getEncryptUltra(user.passwd);
  const newUser = {
    username: user.username,
    passwd: encPasswd,
  };
  profileService
    .getProfile(oldname)
    .then((result1) => {
      //관리자 계정이 아니라면
      if (result1[0].privilege !== 1) {
        //중복 사용자가 아닌지 판별
        userService
          .checkUsername(user.username, oldname)
          .then((result) => {
            //중복이다.
            if (result.exists) {
              weasel.error(
                oldname,
                req.socket.remoteAddress,
                "Unable to update the profile due to duplicate username"
              );
              res.status(401).send({ error: result.message });
            } else {
              //아닐 경우 일단 비밀번호가 변경 되었는지 확인
              userService
                .getPwdByUsername(oldname)
                .then((pwd) => {
                  const decOldPwd = cryptoService.getDecryptUltra(
                    pwd[0].passwd
                  );
                  //이전 비밀번호와 동일
                  if (user.passwd === decOldPwd) {
                    profileService
                      .modUser(newUser, oldname)
                      .then((result2) => {
                        if (user.freq === result1[0].pwd_change_freq) {
                          weasel.log(
                            oldname,
                            req.socket.remoteAddress,
                            "Profile update was successful"
                          );
                          res.send(result2.message);
                        } else {
                          profileService
                            .updateFreq(user.freq)
                            .then((result) => {
                              weasel.log(
                                oldname,
                                req.socket.remoteAddress,
                                "Profile and freq update was successful"
                              );
                              res.send(result.message);
                            })
                            .catch((error) => {
                              weasel.error(
                                oldname,
                                req.socket.remoteAddress,
                                "Failed to update update frequency and profile"
                              );
                              res
                                .status(500)
                                .send("업데이트 잘못된거 같습니다.");
                            });
                        }
                      })
                      .catch((error) => {
                        weasel.error(
                          oldname,
                          req.socket.remoteAddress,
                          "Failed to update the profile"
                        );
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                      });
                  } else {
                    //비밀번호가 변경되었다면 갱신주기 업데이트 이후 변경
                    userService
                      .modifyPwdByFreq(oldname, encPasswd)
                      .then((result) => {
                        profileService
                          .modUser(newUser, oldname)
                          .then((result2) => {
                            weasel.log(
                              oldname,
                              req.socket.remoteAddress,
                              "Profile update was successful"
                            );
                            res.send(result2.message);
                          })
                          .catch((error) => {
                            weasel.error(
                              oldname,
                              req.socket.remoteAddress,
                              "Failed to update the profile"
                            );
                            res.status(500).send("업데이트 잘못된거 같습니다.");
                          });
                      })
                      .catch((error) => {
                        weasel.error(
                          oldname,
                          req.socket.remoteAddress,
                          "Failed to update update frequency and profile"
                        );
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                      });
                  }
                })
                .catch((error) => {
                  weasel.error(
                    oldname,
                    req.socket.remoteAddress,
                    "Failed to retrieve the password"
                  );
                  res.status(500).send("업데이트 잘못된거 같습니다.");
                });
            }
          })
          .catch((error) => {
            weasel.error(
              oldname,
              req.socket.remoteAddress,
              "Failed to perform duplicate user check"
            );
            res.status(401).send({ error: result1.message });
          });
      } else {
        //관리자 계정일때
        //중복 사용자가 아닌지 판별
        userService
          .checkUsername(user.username, oldname)
          .then((result) => {
            //중복
            if (result.exists) {
              weasel.error(
                oldname,
                req.socket.remoteAddress,
                "Unable to update the profile due to duplicate username"
              );
              res.status(401).send({ error: result.message });
            } else {
              //중복아님
              profileService
                .modUser(newUser, oldname)
                .then((result2) => {
                  profileService
                    .updateFreq(user.freq)
                    .then((result) => {
                      weasel.log(
                        oldname,
                        req.socket.remoteAddress,
                        "Profile and freq update was successful"
                      );
                      res.send(result.message);
                    })
                    .catch((error) => {
                      weasel.error(
                        oldname,
                        req.socket.remoteAddress,
                        "Failed to update update frequency and profile"
                      );
                      res.status(500).send("업데이트 잘못된거 같습니다.");
                    });
                })
                .catch((error) => {
                  weasel.error(
                    oldname,
                    req.socket.remoteAddress,
                    "Failed to update the profile"
                  );
                  res.status(500).send("업데이트 잘못된거 같습니다.");
                });
            }
          })
          .catch((error) => {
            weasel.error(
              oldname,
              req.socket.remoteAddress,
              "Failed to perform duplicate user check"
            );
            res.status(401).send({ error: result1.message });
          });
      }
    })
    .catch((error) => {
      weasel.error(
        oldname,
        req.socket.remoteAddress,
        "Failed to retrieve user information."
      );
      res.status(500).send("업데이트 잘못된거 같습니다.");
    });
});

export = router;
