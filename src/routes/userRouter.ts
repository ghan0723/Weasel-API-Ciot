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
        weasel.log(username, req.socket.remoteAddress, "Not exist user ");
        // 에러 메시지와 원하는 URL을 포함한 JSON 응답을 보냄
        res.status(401).json({
          error: "사용자를 찾을 수 없습니다",
          redirectUrl: `${frontIP}/auth/sign-in`,
        });
        return;
      } else {
        userService
          .getPrivilege(username)
          .then((result) => {
            if (result[0].privilege === 1) {
              let decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
              settingService
                .getGUITime()
                .then((cookieTime) => {
                  if (passwd !== decPasswd) {
                    weasel.log(
                      username,
                      req.socket.remoteAddress,
                      "Password do not match "
                    );
                    res.status(401).json({
                      error: "비밀번호가 일치하지 않습니다",
                      redirectUrl: `${frontIP}/auth/sign-in`,
                    });
                    return;
                  } else {
                    userService
                      .getPopupNotice()
                      .then((popup) => {
                        if (popup[0]?.count > 0) {
                          //띄울 팝업이 존재한다면
                          res.cookie("username", user[0].username, {
                            secure: true,
                            maxAge: cookieTime * 1000,
                            path: "/", // 쿠키의 경로 설정
                          });
                          weasel.log(
                            username,
                            req.socket.remoteAddress,
                            "Popup content available."
                          );
                          weasel.log(
                            username,
                            req.socket.remoteAddress,
                            "Success login "
                          );
                          res
                            .status(200)
                            .send({ username, freq: false, notice: true });
                        } else {
                          //팝업이 존재하지 않는다면
                          res.cookie("username", user[0].username, {
                            secure: true,
                            maxAge: cookieTime * 1000,
                            path: "/", // 쿠키의 경로 설정
                          });
                          weasel.log(
                            username,
                            req.socket.remoteAddress,
                            "Success login "
                          );
                          res
                            .status(200)
                            .send({ username, freq: false, notice: false });
                        }
                      })
                      .catch((error5) => {
                        weasel.error(
                          username,
                          req.socket.remoteAddress,
                          "Failed to retrieve popup notice information from the database"
                        );
                        // weasel.error(username, req.socket.remoteAddress, "팝업을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                        console.error("PopupNotice 가져오기 실패:", error5);
                        res.status(500).send(error5);
                      });
                  }
                })
                .catch((error2) => {
                  weasel.error(
                    username,
                    req.socket.remoteAddress,
                    "Failed to get cookie time "
                  );
                  // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                  console.error("쿠키 타임 가져오기 실패:", error2);
                  res.status(500).send(error2);
                });
            } else {
              //관리자 제외 나머지 아이디
              if (user[0]?.enabled !== 1) {
                weasel.log(
                  username,
                  req.socket.remoteAddress,
                  "The user's status is not enabled"
                );
                res.status(500).send({ enabled: false });
              } else {
                let decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
                settingService
                  .getGUITime()
                  .then((cookieTime) => {
                    userService
                      .checkPwdFreq(username)
                      .then((freq) => {
                        if (passwd !== decPasswd) {
                          userService
                            .disabledUser(username, user[0].fail_count + 1)
                            .then((enabled) => {
                              weasel.log(
                                username,
                                req.socket.remoteAddress,
                                "Password do not match "
                              );
                              res.status(401).json({
                                error: "비밀번호가 일치하지 않습니다",
                                redirectUrl: `${frontIP}/auth/sign-in`,
                              });
                            })
                            .catch((enableError) => {
                              weasel.error(
                                username,
                                req.socket.remoteAddress,
                                "Failed to update the fail_count column in the accountlist table in the database "
                              );
                              // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패값을 초기화하는 쿼리 실행 중 오류가 발생했습니다.");
                              res.status(401).json({
                                error: "비밀번호가 일치하지 않습니다",
                                redirectUrl: `${frontIP}/auth/sign-in`,
                              });
                              return;
                            });
                        } else {
                          if (!freq) {
                            //로그인 성공했으니까 fail_count 한번 초기화 해주기
                            userService
                              .failCountDefault(username)
                              .then((result4) => {
                                userService
                                  .getPopupNotice()
                                  .then((popup) => {
                                    if (popup[0]?.count > 0) {
                                      res.cookie("username", user[0].username, {
                                        secure: true,
                                        maxAge: cookieTime * 1000,
                                        path: "/", // 쿠키의 경로 설정
                                      });
                                      weasel.log(
                                        username,
                                        req.socket.remoteAddress,
                                        "Popup content available."
                                      );
                                      weasel.log(
                                        username,
                                        req.socket.remoteAddress,
                                        "Success login "
                                      );
                                      res
                                        .status(200)
                                        .send({ username, freq, notice: true });
                                    } else {
                                      res.cookie("username", user[0].username, {
                                        secure: true,
                                        maxAge: cookieTime * 1000,
                                        path: "/", // 쿠키의 경로 설정
                                      });
                                      weasel.log(
                                        username,
                                        req.socket.remoteAddress,
                                        "Success login "
                                      );
                                      res.status(200).send({
                                        username,
                                        freq,
                                        notice: false,
                                      });
                                    }
                                  })
                                  .catch((error5) => {
                                    weasel.error(
                                      username,
                                      req.socket.remoteAddress,
                                      "Failed to retrieve popup notice information from the database"
                                    );
                                    // weasel.error(username, req.socket.remoteAddress, "팝업을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                                    res.status(500).send(error5);
                                  });
                              })
                              .catch((error5) => {
                                weasel.error(
                                  username,
                                  req.socket.remoteAddress,
                                  "Failed to reset the fail_count column in the accountlist table in the database."
                                );
                                // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패 횟수를 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                              });
                          } else {
                            //freq에 의해 비밀번호를 변경해야 한다
                            weasel.log(
                              username,
                              req.socket.remoteAddress,
                              "Please change password "
                            );
                            // weasel.log(username, req.socket.remoteAddress, "비밀번호 변경 주기가 지났습니다. 비밀번호를 변경으로 이동합니다.");
                            res.status(200).send({ username, freq });
                          }
                        }
                      })
                      .catch((error3) => {
                        weasel.error(
                          username,
                          req.socket.remoteAddress,
                          "Failed to get password frequency. "
                        );
                        // weasel.error(username, req.socket.remoteAddress, "비밀번호 변경 확인값을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                      });
                  })
                  .catch((error2) => {
                    weasel.error(
                      username,
                      req.socket.remoteAddress,
                      "Failed to get cookie time "
                    );
                    // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
                    console.error("쿠키 타임 가져오기 실패:", error2);
                    res.status(500).send(error2);
                  });
              }
            }
          })
          .catch((error) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              "Failed to get privilege"
            );
            // weasel.error(username, req.socket.remoteAddress, "입력한 아이디의 등급을 가져오는 쿼리 실행 중 오류가 발생했습니다.");
            res.redirect(`${frontIP}/auth/sign-in`);
          });
      }
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Other server errors while login"
      );
      // weasel.error(username, req.socket.remoteAddress, "입력받은 아이디를 데이터베이스와 비교하기 위한 쿼리 실행중 오류가 발생했습니다.");
      res.redirect(`${frontIP}/auth/sign-in`);
    });
});

router.post("/add", (req: Request, res: Response) => {
  const user = req.body;
  let encPasswd = cryptoService.getEncryptUltra(user.passwd);
  const newUser = {
    username: user.username,
    passwd: encPasswd,
    privilege: user.privilege,
    ip_ranges: user.range,
  };

  userService
    .getPrivilegeAndIP(user.cookie)
    .then((result) => {
      if (result[0].privilege !== 1) {
        userService
          .checkUsername(user.username)
          .then((result1) => {
            if (result1.exists) {
              weasel.log(user.username, req.socket.remoteAddress, "Failed to add user by exist username ");
              // weasel.log(user.username, req.socket.remoteAddress, "사용자명이 중복되어 생성에 실패했습니다.");
              res.status(401).send({ error: result1.message });
            } else {
              let IpRange = ipCalcService.parseIPRange(result[0].ip_ranges);
              //새로 만든 사용자의 대역이 현재 로그인 한 사용자의 ip 대역을 넘지 않는지 확인
              userService.checkIpRange(user.range, IpRange).then((result3) => {
                if (result3.inRange) {
                  //대역을 넘지 않을 때
                  //freq 값 추가
                  userService
                    .getFreq(user.cookie)
                    .then((result) => {
                      userService
                        .addUser(newUser, result[0].pwd_change_freq)
                        .then((result4) => {
                          weasel.log(user.username, req.socket.remoteAddress, "Success add user ");
                          // weasel.log(user.username, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공했습니다.");
                          res.send(result4.message);
                        })
                        .catch((error) => {
                          weasel.error(user.username, req.socket.remoteAddress, "Failed to add user due to an error from another server ");
                          // weasel.error(user.username, req.socket.remoteAddress, "새로운 사용자 계정 생성에 실패했습니다.");
                          console.error("회원가입 실패:", error);
                          res.status(500).send(error);
                        });
                    })
                    .catch((error) => {
                      weasel.error(user.username, req.socket.remoteAddress, "Failed to get accountlist from pwd_change_freq ");
                      // weasel.error(user.username, req.socket.remoteAddress, "기본 비밀번호 변경 주기를 가져오는데 실패했습니다.");
                      console.error("회원가입 실패:", error);
                      res.status(500).send(error);
                    });
                } else {
                  weasel.log(user.username, req.socket.remoteAddress, "Failed to add user by incorrect IP range ");
                  // weasel.log(user.username, req.socket.remoteAddress, "현재 로그인 중인 사용자의 IP 대역을 초과하는 계정은 생성 할 수 없습니다.");
                  res.status(401).send({ error: result3.message });
                }
              });
            }
          })
          .catch((error) => {
            weasel.error(user.username, req.socket.remoteAddress, "Failed to add user by exist username ");
            // weasel.error(user.username, req.socket.remoteAddress, "중복된 사용자명인지 데이터베이스를 확인하는 데 실패했습니다.");
            res.send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
          });
      } else {
        //관리자로 새로 만들때
        userService.checkUsername(newUser.username).then((result5) => {
          if (result5.exists) {
            weasel.log(user.username, req.socket.remoteAddress, "Failed to add user by exist username ");
            // weasel.log(user.username, req.socket.remoteAddress, "사용자명이 중복되어 생성에 실패했습니다.");
          } else {
            //관리자 계정 freq
            userService
              .getFreq(user.cookie)
              .then((result) => {
                userService
                  .addUser(newUser, result[0].pwd_change_freq)
                  .then((result4) => {
                    weasel.log(user.username, req.socket.remoteAddress, "Success add user ");
                    // weasel.log(user.username, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공했습니다.");
                    res.send(result4.message);
                  })
                  .catch((error) => {
                    weasel.error(user.username, req.socket.remoteAddress, "Failed to add user due to an error from another server ");
                    // weasel.error(user.username, req.socket.remoteAddress, "새로운 사용자 계정 생성에 실패했습니다.");
                    res.status(500).send(error);
                  });
              })
              .catch((error) => {
                weasel.error(user.username, req.socket.remoteAddress, "Failed to get accountlist from pwd_change_freq ");
                // weasel.error(user.username, req.socket.remoteAddress, "기본 비밀번호 변경 주기를 가져오는데 실패했습니다.");
                res.status(500).send(error);
              });
          }
        })
        .catch((error) => {
          weasel.error(user.username, req.socket.remoteAddress, "Failed to add user by exist username ");
          // weasel.error(user.username, req.socket.remoteAddress, "중복된 사용자명인지 데이터베이스를 확인하는 데 실패했습니다.");
          res.send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
        });
      }
    })
    .catch((error2) => {
      weasel.error(user.username, req.socket.remoteAddress, "Failed to get privilege and IP ranges ");
      // weasel.error(user.username, req.socket.remoteAddress, "계정 생성을 위한 현재 로그인 중인 사용자 정보를 가져오는데 실패했습니다.");
      res.send(
        "이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다."
      );
    });
});

router.post("/rm", (req: Request, res: Response) => {
  let users = req.body;
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;
  userService
    .removeUser(users)
    .then((result) => {
      userService
        .getPrivilegeAndIP(username)
        .then((result) => {
          if (result[0].privilege !== 1) {
            let IpRange = ipCalcService.parseIPRange(result[0].ip_ranges);
            userService
              .getUserListByPrivilegeAndIP(
                result[0].privilege,
                IpRange,
                category,
                searchWord
              )
              .then((result2) => {
                weasel.log(username, req.socket.remoteAddress, "Success remove user");
                // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공했습니다.");
                res.status(200).send(result2);
              })
              .catch((error2) => {
                weasel.error(username, req.socket.remoteAddress, "Failed get user list");
                // weasel.error(username, req.socket.remoteAddress, "삭제 후 사용자 관리 페이지에 접근 할 수 없습니다.");
                res.status(500).send("Internal Server Error");
              });
          } else {
            userService
              .getUserListAll(category, searchWord)
              .then((result) => {
                weasel.log(username, req.socket.remoteAddress, "Success remove user by admin ");
                // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공했습니다.");
                res.send(result);
              })
              .catch((error) => {
                weasel.error(username, req.socket.remoteAddress, "Failed get user list");
                // weasel.error(username, req.socket.remoteAddress, "삭제 후 사용자 관리 페이지에 접근 할 수 없습니다.");
                console.error("list 잘못 가져옴:", error);
                res.status(500).send("Internal Server Error");
              });
          }
        })
        .catch((error) => {
          weasel.error(username, req.socket.remoteAddress, "Failed get user infomation");
          // weasel.error(username, req.socket.remoteAddress, "계정 삭제를 위한 현재 로그인 중인 사용자 정보를 가져오는데 실패했습니다.");
          console.error("user 정보 제대로 못 가져옴:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed remove user by server ");
      // weasel.error(username, req.socket.remoteAddress, "사용자 삭제를 실패했습니다.");
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
        privilege: result[0].privilege,
        ip_ranges: result[0].ip_ranges,
        enabled: result[0].enabled,
      };
      res.send([newUser]);
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed get user infomation");
      // weasel.error(username, req.socket.remoteAddress, "수정할 사용자 정보를 가져오는데 실패했습니다.");
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
    privilege: user.privilege,
    ip_ranges: user.mngRange,
  };

  userService
    .getPrivilegeAndIP(user.cookie)
    .then((result1) => {
      userService
        .checkUsername(user.username, oldname)
        .then((result) => {
          if (result.exists) {
            weasel.log(oldname, req.socket.remoteAddress, "Failed to update user information by exist username ");
            // weasel.log(oldname, req.socket.remoteAddress, "변경하려는 사용자명이 중복된 사용자명입니다.");
            res.status(401).send({ error: result.message });
          } else {
            if (result1[0].privilege !== 1) {
              let IpRange = ipCalcService.parseIPRange(result1[0].ip_ranges);
              userService
                .checkIpRange(user.mngRange, IpRange)
                .then((result3) => {
                  if (result3.inRange) {
                    //영역별 관리자가 업데이트 할 때 해당 계정의 비밀번호가 변경 되는지 확인
                    userService.getPwdByUsername(oldname).then((result) => {
                      const decOldPwd = cryptoService.getDecryptUltra(
                        result[0].passwd
                      );
                      if (decOldPwd === user.passwd) {
                        //변경이 안됨 => 주기 초기화 해줄 필요 없음
                        userService
                          .modUser(newUser, oldname)
                          .then((result4) => {
                            weasel.log(oldname, req.socket.remoteAddress, "Success update user information ");
                            // weasel.log(oldname, req.socket.remoteAddress, "사용자 수정을 성공했습니다.");
                            res.send(result4.message);
                          })
                          .catch((error) => {
                            weasel.error(oldname, req.socket.remoteAddress, "Failed to update user information by server ");
                            // weasel.error(oldname, req.socket.remoteAddress, "사용자 수정을 실패했습니다.");
                            console.error("업데이트 실패:", error);
                            res.status(500).send("Internal Server Error");
                          });
                      } else {
                        //변경됨 => 한번 주기 초기화 해줘야함
                        userService
                          .modUser(newUser, oldname)
                          .then((result4) => {
                            userService
                              .modifyPwdByFreq(user.username, encPasswd)
                              .then((result) => {
                                weasel.log(oldname, req.socket.remoteAddress, "Success update user information ");
                                // weasel.log(oldname, req.socket.remoteAddress, "사용자 수정을 성공했습니다.");
                                res.send(result4.message);
                              })
                              .catch((error) => {
                                weasel.error(user.username, req.socket.remoteAddress, "Failed to modify password frequency ");
                                // weasel.error(user.username, req.socket.remoteAddress, "사용자의 비밀번호 주기를 초기화하는 쿼리 실행 중 오류가 발생했습니다.");
                                console.error("업데이트 실패:", error);
                                res.status(500).send("Internal Server Error");
                              });
                          })
                          .catch((error) => {
                            weasel.error(oldname, req.socket.remoteAddress, "Failed to update user information by server ");
                            // weasel.error(oldname, req.socket.remoteAddress, "사용자 수정을 실패했습니다.");
                            console.error("업데이트 실패:", error);
                            res.status(500).send("Internal Server Error");
                          });
                      }
                    });
                  } else {
                    weasel.error(oldname, req.socket.remoteAddress, "Failed to update user by incorrect IP range ");
                    // weasel.error(oldname, req.socket.remoteAddress, "수정할 사용자의 IP 대역이 현재 로그인한 사용자의 IP 대역을 초과하였습니다.");
                    res.status(401).send({ error: result3.message });
                  }
                });
            } else {
              //관리자일 때
              userService
                .checkUsername(user.username, oldname)
                .then((result) => {
                  if (result.exists) {
                    weasel.log(oldname, req.socket.remoteAddress, "Failed to update user information by exist username ");
                    // weasel.log(oldname, req.socket.remoteAddress, "변경하려는 사용자명이 중복된 사용자명입니다.");
                    res.status(401).send({ error: result.message });
                  } else {
                    //관리자 계정으로 업데이트할 때 해당 계정의 비밀번호가 변경되는지 확인
                    userService.getPwdByUsername(oldname).then((result) => {
                      const decOldPwd = cryptoService.getDecryptUltra(
                        result[0].passwd
                      );
                      if (decOldPwd === user.passwd) {
                        //변경이 안됨 => 주기 초기화 해줄 필요 없음
                        userService
                          .modUser(newUser, oldname, user.enabled)
                          .then((result4) => {
                            weasel.log(oldname, req.socket.remoteAddress, "Success update user information ");
                            // weasel.log(oldname, req.socket.remoteAddress, "사용자 수정을 성공했습니다.");
                            res.send(result4.message);
                          })
                          .catch((error) => {
                            weasel.error(oldname, req.socket.remoteAddress, "Failed to update user information by server ");
                            // weasel.error(oldname, req.socket.remoteAddress, "사용자 수정을 실패했습니다.");
                            res.status(500).send("Internal Server Error");
                          });
                      } else {
                        //변경됨 => 한번 주기 초기화 해줘야함
                        userService
                          .modUser(newUser, oldname, user.enabled)
                          .then((result4) => {
                            userService
                              .modifyPwdByFreq(user.username, encPasswd)
                              .then((result) => {
                                weasel.log(oldname, req.socket.remoteAddress, "Success update user information ");
                                // weasel.log(oldname, req.socket.remoteAddress, "사용자 수정을 성공했습니다.");
                                res.send(result4.message);
                              })
                              .catch((error) => {
                                weasel.error(user.username, req.socket.remoteAddress, "Failed to modify password frequency ");
                                // weasel.error(user.username, req.socket.remoteAddress, "사용자의 비밀번호 주기를 초기화하는 쿼리 실행 중 오류가 발생했습니다.");
                                res.status(500).send("Internal Server Error");
                              });
                          })
                          .catch((error) => {
                            weasel.error(oldname, req.socket.remoteAddress, "Failed to update user information by server ");
                            // weasel.error(oldname, req.socket.remoteAddress, "사용자 수정을 실패했습니다.");
                            res.status(500).send("Internal Server Error");
                          });
                      }
                    });
                  }
                });
            }
          }
        })
        .catch((error) => {
          weasel.error(oldname, req.socket.remoteAddress, "Failed to update user information by exist username ");
          // weasel.error(oldname, req.socket.remoteAddress, "사용자명 중복을 확인하기 위한 쿼리 실행중 오류가 발생했습니다.");
          res.send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
        });
    })
    .catch((error2) => {
      weasel.error(oldname, req.socket.remoteAddress, "Failed to get privilege & IP ranges ");
      // weasel.error(oldname, req.socket.remoteAddress, "계정 수정을 위한 현재 로그인 중인 사용자 정보를 가져오는데 실패했습니다.");
      res.send(
        "이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다."
      );
    });
});

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  res.json({ username: username });
});

router.get("/privilege", (req: Request, res: Response) => {
  let username = req.cookies.username;
  userService
    .getPrivilege(username)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("privilege 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/all", (req: Request, res: Response) => {
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;

  userService
    .getPrivilegeAndIP(username)
    .then((result) => {
      if (result[0].privilege !== 1) {
        let IpRange = ipCalcService.parseIPRange(result[0].ip_ranges);
        userService
          .getUserListByPrivilegeAndIP(
            result[0].privilege,
            IpRange,
            category,
            searchWord
          )
          .then((result2) => {
            if (result2[0]) {
              res.send(result2);
            } else {
              res.send([
                {
                  id: "",
                  username: "",
                  privilege: "",
                  ip_ranges: "",
                },
              ]);
            }
          })
          .catch((error2) => {
            res.status(500).send("Internal Server Error");
          });
      } else {
        userService
          .getUserListAll(category, searchWord)
          .then((result) => {
            if (result[0]) {
              res.send(result);
            } else {
              res.send([
                {
                  id: "",
                  username: "",
                  privilege: "",
                  ip_ranges: "",
                },
              ]);
            }
          })
          .catch((error) => {
            res.status(500).send("Internal Server Error");
          });
      }
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });
});

router.get("/check", (req: Request, res: Response) => {
  let username = req.query.username;
  userService
    .getPrivilegeAndIP(username)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("privilege 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/pwd", (req: Request, res: Response) => {
  let username = req.query.username;
  let user = req.body;
  const encPwd = cryptoService.getEncryptUltra(user.newPwd);

  userService
    .getPwdByUsername(username)
    .then((result1) => {
      const decOldPwd = cryptoService.getDecryptUltra(result1[0].passwd);
      if (user.oldPwd !== decOldPwd) {
        weasel.error(
          username,
          req.socket.remoteAddress,
          "Failed to update password frequency by exist old password "
        );
        res.status(401).send("fail");
      } else {
        if (user.newPwd !== user.oldPwd) {
          userService
            .modifyPwdByFreq(username, encPwd)
            .then((result2) => {
              weasel.log(
                username,
                req.socket.remoteAddress,
                "Success update password frequency "
              );
              res.status(200).send(result2);
            })
            .catch((error) => {
              weasel.error(
                username,
                req.socket.remoteAddress,
                "Failed to update password frequency by server "
              );
              res.status(500).send("Internal Server Error");
            });
        } else {
          weasel.error(
            username,
            req.socket.remoteAddress,
            "Failed to update password by old password equal new password"
          );
          res
            .status(500)
            .send(
              "The password before the change and the password after the change are the same."
            );
        }
      }
    })
    .catch((error2) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed to update password frequency by get password "
      );
      res.send("error :" + error2);
    });
});

export = router;
