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
        weasel.error(username, req.socket.remoteAddress, "Not exist user ");
        // 에러 메시지와 원하는 URL을 포함한 JSON 응답을 보냄
        res.status(401).json({
          error: "사용자를 찾을 수 없습니다",
          redirectUrl: `${frontIP}/auth/sign-in`,
        });
        return;
      } else {
        userService.getPrivilege(username).then((result) => {
          if (result[0].privilege === 1) {
            let decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
            settingService
              .getGUITime()
              .then((cookieTime) => {
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
                          "Success Login "
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
                          "Success Login "
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
                        "Failed to get PopupNotice "
                      );
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
                console.error("쿠키 타임 가져오기 실패:", error2);
                res.status(500).send(error2);
              });
          } else {
            //관리자 제외 나머지 아이디
            if (user[0]?.enabled !== 1) {
              weasel.error(
                username,
                req.socket.remoteAddress,
                "This User Can't login"
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
                        userService.disabledUser(username, user[0].fail_count+1)
                        .then((enabled) => {
                          weasel.error(
                            username,
                            req.socket.remoteAddress,
                            "Passwords do not match "
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
                            "Update Fail Login_fail_count"
                          );
                          res.status(401).json({
                            error: "비밀번호가 일치하지 않습니다",
                            redirectUrl: `${frontIP}/auth/sign-in`,
                          });
                          return;
                        })
                      } else {
                        if (!freq) {
                          //로그인 성공했으니까 fail_count 한번 초기화 해주기
                          userService.failCountDefault(username)
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
                                  "Success Login "
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
                                  "Success Login "
                                );
                                res
                                  .status(200)
                                  .send({ username, freq, notice: false });
                              }
                            })
                            .catch((error5) => {
                              weasel.error(
                                username,
                                req.socket.remoteAddress,
                                "Failed to get PopupNotice "
                              );
                              console.error(
                                "PopupNotice 가져오기 실패:",
                                error5
                              );
                              res.status(500).send(error5);
                            });
                          })
                          .catch((error5) => {
                            weasel.error(
                              username,
                              req.socket.remoteAddress,
                              "Failed to Update Fail_Count"
                            );
                          })
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
          }
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
    privilege: user.privilege,
    ip_ranges: user.range,
  };
  userService
    .getPrivilege(user.cookie)
    .then((result) => {
      if (result[0].privilege !== 1) {
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
                .getPrivilegeAndIP(user.cookie)
                .then((result2) => {
                  let IpRange = ipCalcService.parseIPRange(
                    result2[0].ip_ranges
                  );
                  userService
                    .checkIpRange(user.range, IpRange)
                    .then((result3) => {
                      if (result3.inRange) {
                        //freq 값 추가
                        userService
                          .getFreq(user.cookie)
                          .then((result) => {
                            userService
                              .addUser(newUser, result[0].pwd_change_freq)
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
                          })
                          .catch((error) => {
                            weasel.error(
                              user.username,
                              req.socket.remoteAddress,
                              "Failed to Get Freq "
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
                    "Failed to Get Privilege & IP Ranges "
                  );
                  res.send(
                    "이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다."
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
            //관리자 계정 freq
            userService
              .getFreq(user.cookie)
              .then((result) => {
                userService
                  .addUser(newUser, result[0].pwd_change_freq)
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
              })
              .catch((error) => {
                weasel.error(
                  user.username,
                  req.socket.remoteAddress,
                  "Failed to Get Freq "
                );
                console.error("회원가입 실패:", error);
                res.status(500).send(error);
              });
          }
        });
      }
    })
    .catch((error) => {
      weasel.error(
        user.username,
        req.socket.remoteAddress,
        "Failed to Get Privilege"
      );
      console.error("회원가입 실패:", error);
      res.status(500).send(error);
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
        .getPrivilege(username)
        .then((result1) => {
          if (result1[0].privilege !== 1) {
            userService
              .getPrivilegeAndIP(username)
              .then((result) => {
                let IpRange = ipCalcService.parseIPRange(result[0].ip_ranges);
                userService
                  .getUserListByPrivilegeAndIP(
                    result[0].privilege,
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
            "Failed to Get Privilege"
          );
          console.error("list 잘못 가져옴:", error);
          res.status(500).send("Internal Server Error");
        });
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
        privilege: result[0].privilege,
        ip_ranges: result[0].ip_ranges,
        enabled:result[0].enabled,
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
    privilege: user.privilege,
    ip_ranges: user.mngRange,
  };
  userService
    .getPrivilege(user.cookie)
    .then((result) => {
      if (result[0].privilege !== 1) {
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
                .getPrivilegeAndIP(user.cookie)
                .then((result2) => {
                  let IpRange = ipCalcService.parseIPRange(
                    result2[0].ip_ranges
                  );
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
                            //변경됨 => 한번 주기 초기화 해줘야함
                            userService
                              .modUser(newUser, oldname)
                              .then((result4) => {
                                userService
                                  .modifyPwdByFreq(user.username, encPasswd)
                                  .then((result) => {
                                    weasel.log(
                                      oldname,
                                      req.socket.remoteAddress,
                                      "Success Update User Information "
                                    );
                                    res.send(result4.message);
                                  })
                                  .catch((error) => {
                                    weasel.error(
                                      user.username,
                                      req.socket.remoteAddress,
                                      "Failed to Modify Pwd Freq "
                                    );
                                    console.error("업데이트 실패:", error);
                                    res
                                      .status(500)
                                      .send("Internal Server Error");
                                  });
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
                          }
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
                    "Failed to Get Privilege & IP Ranges "
                  );
                  res.send(
                    "이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다."
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
            //관리자 계정으로 업데이트할 때 해당 계정의 비밀번호가 변경되는지 확인
            userService.getPwdByUsername(oldname).then((result) => {
              const decOldPwd = cryptoService.getDecryptUltra(result[0].passwd);
              if (decOldPwd === user.passwd) {
                //변경이 안됨 => 주기 초기화 해줄 필요 없음
                userService
                  .modUser(newUser, oldname, user.enabled)
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
                //변경됨 => 한번 주기 초기화 해줘야함
                userService
                  .modUser(newUser, oldname, user.enabled)
                  .then((result4) => {
                    userService
                      .modifyPwdByFreq(user.username, encPasswd)
                      .then((result) => {
                        weasel.log(
                          oldname,
                          req.socket.remoteAddress,
                          "Success Update User Information "
                        );
                        res.send(result4.message);
                      })
                      .catch((error) => {
                        weasel.error(
                          user.username,
                          req.socket.remoteAddress,
                          "Failed to Modify Pwd Freq "
                        );
                        console.error("업데이트 실패:", error);
                        res.status(500).send("Internal Server Error");
                      });
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
              }
            });
          }
        });
      }
    })
    .catch((error) => {
      weasel.error(
        oldname,
        req.socket.remoteAddress,
        "Failed to Get Privilege"
      );
      res.send(
        "이거는 쿠키 가지고 privilege 가져오는 도중에 발생하는 에러입니다."
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
    .getPrivilege(username)
    .then((result) => {
      if (result[0].privilege !== 1) {
        userService
          .getPrivilegeAndIP(username)
          .then((result) => {
            let IpRange = ipCalcService.parseIPRange(result[0].ip_ranges);
            userService
              .getUserListByPrivilegeAndIP(
                result[0].privilege,
                IpRange,
                category,
                searchWord
              )
              .then((result2) => {
                weasel.log(
                  username,
                  req.socket.remoteAddress,
                  `Success to Load User Control Page category=${category}, searchWord=${searchWord}`
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
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "Failed to Get Privilege"
      );
      console.error("user 정보 제대로 못 가져옴:", error);
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
          "Failed to Update Pwd Freq By Exist OldPwd "
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
        } else {
          weasel.error(
            username,
            req.socket.remoteAddress,
            "Failed to Update Pwd By Old Pwd Equals New Pwd"
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
        "Failed to Update Pwd Freq By Get Pwd "
      );
      res.send("error :" + error2);
    });
});

export = router;
