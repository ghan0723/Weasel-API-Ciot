import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import CryptoService from "../service/cryptoService";
import { frontIP } from "../interface/ipDomain";
import SettingService from "../service/settingService";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const cryptoService = new CryptoService("sn0ISmjyz1CWT6Yb7dxu");
const settingService: SettingService = new SettingService();

router.post("/login", (req: Request, res: Response) => {
  const { username, passwd }: { username: string; passwd: string } = req.body;
  userService
    .getLogin(username)
    .then((user) => {
      if (user.length === 0) {
        weasel.error(
          username,
          req.socket.remoteAddress,
          "Not exist user "
        );
        // 에러 메시지와 원하는 URL을 포함한 JSON 응답을 보냄
        res.status(401).json({
          error: "사용자를 찾을 수 없습니다",
          redirectUrl: `${frontIP}/auth/sign-in`,
        });
        return;
      } else {
        let decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
        settingService
          .getGUITime()
          .then((cookieTime) => {
            userService
              .checkPwdFreq(username)
              .then((freq) => {
                if (passwd !== decPasswd) {
                  weasel.error(
                    username,
                    req.socket.remoteAddress,
                    "Passwords do not match "
                  );
                  res.status(401).json({
                    error: "비밀번호가 일치하지 않습니다",
                    redirectUrl: `${frontIP}/auth/sign-in`,
                  });
                  return;
                } else {
                  if (!freq) {
                    res.cookie("username", user[0].username, {
                      httpOnly: true,
                      maxAge: cookieTime * 1000,
                      path: "/", // 쿠키의 경로 설정
                    });
                    weasel.log(
                      username,
                      req.socket.remoteAddress,
                      "Success Login "
                    );
                    res.status(200).send({ username, freq });
                  } else {
                    //freq 보고 판별
                    weasel.log(
                      username,
                      req.socket.remoteAddress,
                      "Please Change Pwd "
                    );
                    res.status(200).send({ username, freq });
                  }
                }
              })
              .catch((error3) => {
                weasel.error(
                  username,
                  req.socket.remoteAddress,
                  "Failed to get Pwd Freq "
                );
              });
          })
          .catch((error2) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed to get cookie time "
            );
            console.error("쿠키 타임 가져오기 실패:", error2);
            res.status(500).send(error2);
          });
      }
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Server error ");
      res.redirect(`${frontIP}/auth/sign-in`);
      // res.status(500).send("서버 내부 오류가 발생했습니다.");
    });
});

router.post("/add", (req: Request, res: Response) => {
  const user = req.body;
  let encPasswd = cryptoService.getEncryptUltra(user.passwd);
  const newUser = {
    username: user.username,
    passwd: encPasswd,
    grade: user.grade,
    mng_ip_ranges: user.range,
  };
  if (user.cookie !== "admin") {
    userService
      .checkUsername(user.username)
      .then((result) => {
        if (result.exists) {
          weasel.error(
            user.username,
            req.socket.remoteAddress,
            "Failed to Add User By Exist Username "
          );
          res.status(401).send({ error: result.message });
        } else {
          userService
            .getGradeAndMngip(user.cookie)
            .then((result2) => {
              let IpRange = ipCalcService.parseIPRange(
                result2[0].mng_ip_ranges
              );
              userService.checkIpRange(user.range, IpRange).then((result3) => {
                if (result3.inRange) {
                  userService
                    .addUser(newUser)
                    .then((result4) => {
                      weasel.log(
                        user.username,
                        req.socket.remoteAddress,
                        "Success Add User "
                      );
                      res.send(result4.message);
                    })
                    .catch((error) => {
                      weasel.error(
                        user.username,
                        req.socket.remoteAddress,
                        "Failed to Add User By Server "
                      );
                      console.error("회원가입 실패:", error);
                      res.status(500).send(error);
                    });
                } else {
                  weasel.error(
                    user.username,
                    req.socket.remoteAddress,
                    "Failed to Add User By Incorrect IP Range "
                  );
                  res.status(401).send({ error: result3.message });
                }
              });
            })
            .catch((error2) => {
              weasel.error(
                user.username,
                req.socket.remoteAddress,
                "Failed to Get Grade & IP Ranges "
              );
              res.send(
                "이거는 쿠키 가지고 grade랑 mngip 가져오는 도중에 발생하는 에러입니다."
              );
            });
        }
      })
      .catch((error) => {
        weasel.error(
          user.username,
          req.socket.remoteAddress,
          "Failed to Add User By Exist Username "
        );
        res.send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
      });
  } else {
    userService.checkUsername(newUser.username).then((result5) => {
      if (result5.exists) {
        weasel.error(
          user.username,
          req.socket.remoteAddress,
          "Failed to Add User By Exist Username "
        );
      } else {
        userService
          .addUser(newUser)
          .then((result4) => {
            weasel.log(
              user.username,
              req.socket.remoteAddress,
              "Success Add User By Admin "
            );
            res.send(result4.message);
          })
          .catch((error) => {
            weasel.error(
              user.username,
              req.socket.remoteAddress,
              "Failed to Add User By Admin "
            );
            console.error("회원가입 실패:", error);
            res.status(500).send(error);
          });
      }
    });
  }
});

router.post("/rm", (req: Request, res: Response) => {
  let users = req.body;
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;
  userService
    .removeUser(users)
    .then((result) => {
      if (username !== "admin") {
        userService
          .getGradeAndMngip(username)
          .then((result) => {
            let IpRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
            userService
              .getUserListByGradeAndMngip(
                result[0].grade,
                IpRange,
                category,
                searchWord
              )
              .then((result2) => {
                weasel.log(
                  username,
                  req.socket.remoteAddress,
                  "Success Remove User "
                );
                res.status(200).send(result2);
              })
              .catch((error2) => {
                weasel.error(
                  username,
                  req.socket.remoteAddress,
                  "Failed Remove User By Get User List "
                );
                console.error("list를 제대로 못 가져옴:", error2);
                res.status(500).send("Internal Server Error");
              });
          })
          .catch((error) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed Remove User By Username "
            );
            console.error("user 정보 제대로 못 가져옴:", error);
            res.status(500).send("Internal Server Error");
          });
      } else {
        userService
          .getUserListAll(category, searchWord)
          .then((result) => {
            weasel.log(
              username,
              req.socket.remoteAddress,
              "Success Remove User By Admin "
            );
            res.send(result);
          })
          .catch((error) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed Remove User By Server "
            );
            console.error("list 잘못 가져옴:", error);
            res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed Remove User By Server "
      );
      console.error("실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/modify/:username", (req: Request, res: Response) => {
  let username = req.params.username;
  userService
    .getUser(username)
    .then((result) => {
      const decPasswd = cryptoService.getDecryptUltra(result[0].passwd);
      let newUser = {
        username: result[0].username,
        passwd: decPasswd,
        grade: result[0].grade,
        mng_ip_ranges: result[0].mng_ip_ranges,
      };
      weasel.log(
        username,
        req.socket.remoteAddress,
        "Success to Get Modify User Information "
      );
      res.send([newUser]);
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed to Get User Information By Username "
      );
      console.error("보내기 실패:", error);
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
    grade: user.grade,
    mng_ip_ranges: user.mngRange,
  };
  if (user.cookie !== "admin") {
    userService
      .checkUsername(user.username, oldname)
      .then((result) => {
        if (result.exists) {
          weasel.error(
            oldname,
            req.socket.remoteAddress,
            "Failed to Update User Information By Exist Username "
          );
          res.status(401).send({ error: result.message });
        } else {
          userService
            .getGradeAndMngip(user.cookie)
            .then((result2) => {
              let IpRange = ipCalcService.parseIPRange(
                result2[0].mng_ip_ranges
              );
              userService
                .checkIpRange(user.mngRange, IpRange)
                .then((result3) => {
                  if (result3.inRange) {
                    userService
                      .modUser(newUser, oldname)
                      .then((result4) => {
                        weasel.log(
                          oldname,
                          req.socket.remoteAddress,
                          "Success Update User Information "
                        );
                        res.send(result4.message);
                      })
                      .catch((error) => {
                        weasel.error(
                          oldname,
                          req.socket.remoteAddress,
                          "Failed to Update User Information By Server "
                        );
                        console.error("업데이트 실패:", error);
                        res.status(500).send("Internal Server Error");
                      });
                  } else {
                    weasel.error(
                      oldname,
                      req.socket.remoteAddress,
                      "Failed to Update User By Incorrect IP Range "
                    );
                    res.status(401).send({ error: result3.message });
                  }
                });
            })
            .catch((error2) => {
              weasel.error(
                oldname,
                req.socket.remoteAddress,
                "Failed to Get Grade & IP Ranges "
              );
              res.send(
                "이거는 쿠키 가지고 grade랑 mngip 가져오는 도중에 발생하는 에러입니다."
              );
            });
        }
      })
      .catch((error) => {
        weasel.error(
          oldname,
          req.socket.remoteAddress,
          "Failed to Update User Information By Exist Username "
        );
        res.send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
      });
  } else {
    userService.checkUsername(user.username, oldname).then((result) => {
      if (result.exists) {
        weasel.error(
          oldname,
          req.socket.remoteAddress,
          "Failed to Update User Information By Exist Username "
        );
        res.status(401).send({ error: result.message });
      } else {
        userService
          .modUser(newUser, oldname)
          .then((result4) => {
            weasel.log(
              oldname,
              req.socket.remoteAddress,
              "Success Update User Information By Admin "
            );
            res.send(result4.message);
          })
          .catch((error) => {
            weasel.error(
              oldname,
              req.socket.remoteAddress,
              "Failed to Update User Information By Admin "
            );
            console.error("업데이트 실패:", error);
            res.status(500).send("Internal Server Error");
          });
      }
    });
  }
});

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  res.json({ username: username });
});

router.get("/grade", (req: Request, res: Response) => {
  let username = req.query.username;
  console.log("username : ", username);
  userService
    .getGrade(username)
    .then((result) => {
      console.log("grade : ", result);
      res.send(result);
    })
    .catch((error) => {
      console.error("grade 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/all", (req: Request, res: Response) => {
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;
  if (username !== "admin") {
    userService
      .getGradeAndMngip(username)
      .then((result) => {
        let IpRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
        userService
          .getUserListByGradeAndMngip(
            result[0].grade,
            IpRange,
            category,
            searchWord
          )
          .then((result2) => {
            weasel.log(
              username,
              req.socket.remoteAddress,
              "Success to Load User Control Page "
            );
            res.status(200).send(result2);
          })
          .catch((error2) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed to Load User Control Page "
            );
            console.error("list를 제대로 못 가져옴:", error2);
            res.status(500).send("Internal Server Error");
          });
      })
      .catch((error) => {
        weasel.error(
          username,
          req.socket.remoteAddress,
          "Failed to Load User Control Page "
        );
        console.error("user 정보 제대로 못 가져옴:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    userService
      .getUserListAll(category, searchWord)
      .then((result) => {
        weasel.log(
          username,
          req.socket.remoteAddress,
          "Success to Load User Control Page "
        );
        res.send(result);
      })
      .catch((error) => {
        weasel.error(
          username,
          req.socket.remoteAddress,
          "Failed to Load User Control Page "
        );
        console.error("list 잘못 가져옴:", error);
        res.status(500).send("Internal Server Error");
      });
  }
});

router.get("/check", (req: Request, res: Response) => {
  let username = req.query.username;
  userService
    .getGradeAndMngip(username)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("grade 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/pwd", (req: Request, res: Response) => {
  let username = req.query.username;
  let user = req.body;
  const encPwd = cryptoService.getEncryptUltra(user.newPwd);
  console.log("encPwd : ", encPwd);
  userService
    .getPwdByUsername(username)
    .then((result1) => {
      const decOldPwd = cryptoService.getDecryptUltra(result1[0].passwd);
      if (user.oldPwd !== decOldPwd) {
        weasel.error(
          username,
          req.socket.remoteAddress,
          "Failed to Update Pwd Freq By Exist OldPwd "
        );
        res.status(401).send("fail");
      } else {
        userService
          .modifyPwdByFreq(username, encPwd)
          .then((result2) => {
            weasel.log(
              username,
              req.socket.remoteAddress,
              "Success Update Pwd Freq "
            );
            res.status(200).send(result2);
          })
          .catch((error) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed to Update Pwd Freq By Server "
            );
            res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((error2) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed to Update Pwd Freq By Get Pwd "
      );
      res.send("error :" + error2);
    });
});

export = router;
