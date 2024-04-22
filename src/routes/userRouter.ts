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
        weasel.log(username, req.socket.remoteAddress, `[WARN] [UserService] - User '${username}' The username doesn't exist.`);
        // weasel.log(username, req.socket.remoteAddress, "입력한 아이디가 존재하지 않습니다.");
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
                    weasel.log(username,req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' The username or password is incorrect.`);
                    // weasel.log(username,req.socket.remoteAddress,"아이디, 혹은 비밀번호가 맞지 않습니다.");
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
                          weasel.log(username,req.socket.remoteAddress,`[INFO] [UserService] - User '${username}' Check the contents of the Sign in successfully popup.`);
                          // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다 팝업의 내용을 확인해주세요.");
                          res
                            .status(200)
                            .send({ username, freq: false, notice: true,  });
                        } else {
                          //팝업이 존재하지 않는다면
                          res.cookie("username", user[0].username, {
                            secure: true,
                            maxAge: cookieTime * 1000,
                            path: "/", // 쿠키의 경로 설정
                          });
                          weasel.log(username,req.socket.remoteAddress,`[INFO] [UserService] - User '${username}' successfully logged in.`);
                          // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다.");
                          res
                            .status(200)
                            .send({ username, freq: false, notice: false,  });
                        }
                      })
                      .catch((error5) => {
                        weasel.error(username,req.socket.remoteAddress,`[ERROR] [UserService] - User '${username}' An error occurred while executing the query that queries the popup to the database.`);
                        // weasel.error(username,req.socket.remoteAddress,"팝업을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                        res.status(500).send(error5);
                      });
                  }
                })
                .catch((error2) => {
                  weasel.error(username,req.socket.remoteAddress,`[ERROR] [UserService] - User '${username}' An error occurred while executing a query to look up the server's Guitime in the database.`);
                  // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                  res.status(500).send(error2);
                });
            } else {
              //관리자 제외 나머지 아이디
              if (user[0]?.enabled !== 1) {
                weasel.log(username,req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' The user's status is not enabled.`);
                // weasel.log(username,req.socket.remoteAddress,"사용자 상태가 활성화되지 않았습니다.");
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
                              if(user[0].fail_count + 1 >= 5){
                                weasel.log(username,req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' temporarily inaccessible because password incorrectly more than five times.`);
                                // weasel.log(username,req.socket.remoteAddress,"비밀번호를 5회 이상 잘못 입력하여 계정이 일시적으로 접근 불가 상태로 변경됩니다.");
                              } else {
                                weasel.log(username,req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' Incorrect password ${user[0].fail_count + 1} times.`);
                                // weasel.log(username,req.socket.remoteAddress,"비밀번호를 n회 틀렸습니다.");
                              }
                              res.status(401).json({
                                error: "비밀번호가 일치하지 않습니다",
                                redirectUrl: `${frontIP}/auth/sign-in`,
                              });
                            })
                            .catch((enableError) => {
                              weasel.error(username,req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' An error occurred while executing a query to initialize the number of failed password entry attempts.`);
                              // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패 횟수를 초기화하는 쿼리 실행 중 오류가 발생했습니다.");
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
                                      weasel.log(username,req.socket.remoteAddress,`[INFO] [UserService] - User '${username}' Check the contents of the Sign in successfully popup.`);
                                      // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다 팝업의 내용을 확인해주세요.");
                                      res
                                        .status(200)
                                        .send({ username, freq, notice: true,  });
                                    } else {
                                      res.cookie("username", user[0].username, {
                                        secure: true,
                                        maxAge: cookieTime * 1000,
                                        path: "/", // 쿠키의 경로 설정
                                      });
                                      weasel.log(username,req.socket.remoteAddress,`[INFO] [UserService] - User '${username}' successfully logged in.`);
                                      // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다.");
                                      res.status(200).send({
                                        username,
                                        freq,
                                        notice: false,
                                      });
                                    }
                                  })
                                  .catch((error5) => {
                                    weasel.error(username,req.socket.remoteAddress,`[ERROR] [UserService] - User '${username}' An error occurred while executing the query that queries the popup to the database.`);
                                    // weasel.error(username, req.socket.remoteAddress, "팝업을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                    res.status(500).send(error5);
                                  });
                              })
                              .catch((error5) => {
                                weasel.error(username,req.socket.remoteAddress,`[ERROR] [UserService] - User '${username}' An error occurred while executing a query that queries the database for the number of failed password attempts.`);
                                // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패 횟수를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                res.status(500).send(error5);
                              });
                          } else {
                            //freq에 의해 비밀번호를 변경해야 한다
                            weasel.log(username,req.socket.remoteAddress,`[INFO] [UserService] - User '${username}' overdue for a password change. Go to the Change password screen`);
                            // weasel.log(username, req.socket.remoteAddress, "비밀번호 변경 주기가 지났습니다. 비밀번호 변경 화면으로 이동합니다.");
                            res.status(200).send({ username, freq });
                          }
                        }
                      })
                      .catch((error3) => {
                        weasel.error(username,req.socket.remoteAddress,`[ERROR] [UserService] - User '${username}' An error occurred while executing a query that queries the database for password change intervals.`);
                        // weasel.error(username, req.socket.remoteAddress, "비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                        res.status(500).send(error3);
                      });
                  })
                  .catch((error2) => {
                    weasel.error(
                      username,
                      req.socket.remoteAddress,
                      `[ERROR] [UserService] - User '${username}' An error occurred while executing a query to look up the server's Guitime in the database.`
                    );
                    // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                    res.status(500).send(error2);
                  });
              }
            }
          })
          .catch((error) => {
            weasel.error(
              username,
              req.socket.remoteAddress,
              `[ERROR] [UserService] - User '${username}' An error occurred while running the query to query the database for the rating of the ID.`
            );
            // weasel.error(username, req.socket.remoteAddress, "입력한 아이디의 등급을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
            res.redirect(`${frontIP}/auth/sign-in`);
          });
      }
    })
    .catch((error) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        `[ERROR] [UserService] - User '${username}' An error occurred while executing the query to look up the entered ID in the database.`
      );
      // weasel.error(username, req.socket.remoteAddress, "입력한 아이디를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
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
      // 관리자가 아닐 때
      if (result[0].privilege !== 1) {
        userService
          .checkUsername(user.username)
          .then((result1) => {
            if (result1.exists) {
              weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' username is a duplicate and cannot be created.`);
              // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 생성할 수 없습니다.");
              res.status(401).send({ error: '입력한 사용자명이 중복되어 생성할 수 없습니다.' });
            } else {
              let IpRange = IpCalcService.parseIPRange(result[0].ip_ranges);
              let IpRange2 = IpCalcService.parseIPRange(user.range);
              //새로 만든 사용자의 대역이 현재 로그인 한 사용자의 ip 대역을 넘지 않는지 확인
              UserService.checkIpRange(IpRange2, IpRange).then((result3) => {
                if (result3.inRange) {
                  //대역을 넘지 않을 때
                  //freq 값 추가
                  userService
                    .getFreq(user.cookie)
                    .then((result) => {
                      userService
                        .addUser(newUser, result[0].pwd_change_freq)
                        .then((result4) => {
                          weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' Successfully created a new user account.`);
                          // weasel.log(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공하였습니다.");
                          res.send(result4.message);
                        })
                        .catch((error) => {
                          weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to add a new user account to the database.`);
                          // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정을 데이터베이스에 추가하는 쿼리 실행 중 오류가 발생하였습니다.");
                          res.status(500).send(error);
                        });
                    })
                    .catch((error) => {
                      weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' There was an error running a query to the database to see how often the currently logged in user has changed their password.`);
                      // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                      res.status(500).send(error);
                    });
                } else {
                  weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' can't create an account that exceeds the IP band of the user currently logged in.`);
                  // weasel.log(user.cookie, req.socket.remoteAddress, "현재 로그인 중인 사용자의 IP 대역을 초과하는 계정은 생성할 수 없습니다.");
                  res.status(401).send({ error: result3.message });
                }
              });
            }
          })
          .catch((error) => {
            weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to look up a new username in the database.`);
            // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
            res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
          });
      } else {
        //관리자로 새로 만들때
        userService.checkUsername(newUser.username).then((result5) => {
          if (result5.exists) {
            weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' The username is a duplicate and cannot be created.`);
            // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 생성할 수 없습니다.");
            res.status(401).send({ error: '입력한 사용자명이 중복되어 생성할 수 없습니다.' });
          } else {
            //관리자 계정 freq
            userService
              .getFreq(user.cookie)
              .then((result) => {
                userService
                  .addUser(newUser, result[0].pwd_change_freq)
                  .then((result4) => {
                    weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' Successfully created a new user account.`);
                    // weasel.log(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공하였습니다.");
                    res.send(result4.message);
                  })
                  .catch((error) => {
                    weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to add a new user account to the database.`);
                    // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정을 데이터베이스에 추가하는 쿼리 실행 중 오류가 발생하였습니다.");
                    res.status(500).send(error);
                  });
              })
              .catch((error) => {
                weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' There was an error running a query to the database to see how often the currently logged in user has changed their password.`);
                // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                res.status(500).send(error);
              });
          }
        })
        .catch(() => {
          weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to look up a new username in the database.`);
          // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
          res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
        });
      }
    })
    .catch(() => {
      weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' There was an error executing a query to the database to look up the rating and IP band of the currently logged in user.`);
      // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
      res.status(500).send(
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
    .then(() => {
      userService
        .getIdAndPriAndIp(username)
        .then((result) => {
          let IpRange = IpCalcService.parseIPRange(result[0].ip_ranges);
          if (result[0].privilege !== 1) {
            userService
              .getUserListByPrivilegeAndIP(
                result[0].privilege,
                IpRange,
                category,
                searchWord
              )
              .then((result2) => {
                weasel.log(username, req.socket.remoteAddress, `[INFO] [UserService] - User '${username}' Successfully deleted the user.`);
                // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공하였습니다.");
                res.status(200).send(result2);
              })
              .catch((error2) => {
                weasel.error(username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' Failed to navigate to the Manage Users menu after deleting a user account.`);
                // weasel.error(username, req.socket.remoteAddress, "사용자 계정 삭제 이후 사용자 관리 메뉴로 이동에 실패하였습니다.");
                res.status(500).send("Internal Server Error");
              });
          } else {
            userService
              .getUserListAll(category, searchWord, result[0].id, IpRange)
              .then((result) => {
                weasel.log(username, req.socket.remoteAddress, `[INFO] [UserService] - User '${username}' Successfully deleted the user.`);
                // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공하였습니다.");
                res.send(result);
              })
              .catch((error) => {
                weasel.error(username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' Failed to navigate to the Manage Users menu after deleting a user account.`);
                // weasel.error(username, req.socket.remoteAddress, "사용자 계정 삭제 이후 사용자 관리 메뉴로 이동에 실패하였습니다.");
                res.status(500).send("Internal Server Error");
              });
          }
        })
        .catch((error) => {
          weasel.error(username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' There was an error executing a query to the database to look up the rating and IP band of the currently logged in user.`);
          // weasel.error(username, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' An error occurred while executing a query to delete user accounts to the database.`);
      // weasel.error(username, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 삭제하는 쿼리 실행 중 오류가 발생하였습니다.");
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
      weasel.error(username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${username}' Failed to navigate to the Edit User menu.`);
      // weasel.error(username, req.socket.remoteAddress, "사용자 수정 메뉴로 이동에 실패하였습니다.");
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
            weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' The username is a duplicate and can't be changed.`);
            // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다. ");
            res.status(401).send({ error: result.message });
          } else {
            // 관리자 계정이 아닐 때
            if (result1[0].privilege !== 1) {
              let IpRange = IpCalcService.parseIPRange(result1[0].ip_ranges);
              let IpRange2 = IpCalcService.parseIPRange(user.mngRange);
              UserService
                .checkIpRange(IpRange2, IpRange)
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
                            weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' The user modification was successful.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                            res.send(result4.message);
                          })
                          .catch((error) => {
                            weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to change user accounts in the database.`);
                            // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
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
                                weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' The user modification was successful.`);
                                // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                res.send(result4.message);
                              })
                              .catch((error) => {
                                weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' Renewing the password change cycle for the changed user account failed.`);
                                // weasel.error(user.cookie, req.socket.remoteAddress, "변경한 사용자 계정의 비밀번호 변경 주기를 갱신하는데 실패하였습니다.");
                                res.status(500).send("Internal Server Error");
                              });
                          })
                          .catch((error) => {
                            weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to change user accounts in the database.`);
                            // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
                            res.status(500).send("Internal Server Error");
                          });
                      }
                    });
                  } else {
                    weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' can't change to an account that exceeds the IP band of the user currently logged in.`);
                    // weasel.log(user.cookie, req.socket.remoteAddress, "현재 로그인 중인 사용자의 IP 대역을 초과하는 계정으로 변경할 수 없습니다.");
                    res.status(401).send({ error: result3.message });
                  }
                });
            } else {
              //관리자일 때
              userService
                .checkUsername(user.username, oldname)
                .then((result) => {
                  if (result.exists) {
                    weasel.log(user.cookie, req.socket.remoteAddress, `[WARN] [UserService] - User '${user.cookie}' The username is a duplicate and can't be changed.`);
                    // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다. ");
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
                            weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' The user modification was successful.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                            res.send(result4.message);
                          })
                          .catch(() => {
                            weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to change user accounts in the database.`);
                            // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
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
                                weasel.log(user.cookie, req.socket.remoteAddress, `[INFO] [UserService] - User '${user.cookie}' The user modification was successful.`);
                                // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                res.send(result4.message);
                              })
                              .catch((error) => {
                                weasel.error(user.username, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' Renewing the password change cycle for the changed user account failed.`);
                                // weasel.error(user.username, req.socket.remoteAddress, "변경한 사용자 계정의 비밀번호 변경 주기를 갱신하는데 실패하였습니다.");
                                res.status(500).send("Internal Server Error");
                              });
                          })
                          .catch((error) => {
                            weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing a query to change user accounts in the database.`);
                            // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
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
          weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' An error occurred while executing the query that queries the database for the username to change.`);
          // weasel.error(user.cookie, req.socket.remoteAddress, "변경할 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
          res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
        });
    })
    .catch((error2) => {
      weasel.error(user.cookie, req.socket.remoteAddress, `[ERROR] [UserService] - User '${user.cookie}' There was an error executing a query to the database to look up the rating and IP band of the currently logged in user.`);
      // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
      res.status(500).send(
        "이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다."
      );
    });
});

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  
  if(username !== undefined && username !== null){
    res.json({ username: username });
  } else {
    res.status(500).send({username})
  }
});

router.get("/privilege", (req: Request, res: Response) => {
  let username = req.cookies.username;
  
  userService
    .getPrivilege(username)
    .then((result) => {   
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });
});

router.get("/all", (req: Request, res: Response) => {
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;

  userService
    .getIdAndPriAndIp(username)
    .then((result) => {
      let IpRange = IpCalcService.parseIPRange(result[0].ip_ranges);
      if (result[0].privilege !== 1) {
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
                  username: "",
                  privilege: "",
                  enabled: "",
                  ip_ranges: "",
                },
              ]);
            }
          })
          .catch((error2) => {
            res.status(500).send("Internal Server Error");
          });
      } else {
        //관리자
        userService
          .getUserListAll(category, searchWord, result[0].id, IpRange)
          .then((result) => {
            
            if (result[0]) {
              res.send(result);
            } else {
              res.send([
                {
                  username: "",
                  privilege: "",
                  enabled: "",
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
    .getIdAndPriAndIp(username)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
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
        weasel.log(username, req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' the password incorrectly before changing it.`);
        // weasel.log(username,req.socket.remoteAddress,"변경 전 비밀번호를 잘못 입력하였습니다.");
        res.status(401).send("fail");
      } else {
        if (user.newPwd !== user.oldPwd) {
          userService
            .modifyPwdByFreq(username, encPwd)
            .then((result2) => {
              weasel.log(username, req.socket.remoteAddress, `[INFO] [UserService] - User '${username}' successfully changed account password.`);
              // weasel.log(username,req.socket.remoteAddress,"계정 비밀번호 변경을 성공했습니다.");
              res.status(200).send(result2);
            })
            .catch((error) => {
              weasel.error(
                username,
                req.socket.remoteAddress,
                `[ERROR] [UserService] - User '${username}' Password cycle renewal failed.`
              );
              // weasel.error(username,req.socket.remoteAddress,"비밀번호 주기를 새로 갱신하는데 실패하였습니다.");
              res.status(500).send("Internal Server Error");
            });
        } else {
          weasel.log(username,req.socket.remoteAddress,`[WARN] [UserService] - User '${username}' The new password matches the existing password.`);
          // weasel.log(username,req.socket.remoteAddress,"입력한 새 비밀번호가 기존의 비밀번호와 일치합니다.");
          res.status(403).send({
              error : "입력한 새 비밀번호가 기존의 비밀번호와 일치합니다."
            });
        }
      }
    })
    .catch((error2) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        `[ERROR] [UserService] - User '${username}' An error occurred while running a query to the database for the pre-change password.`
      );
      // weasel.error(username,req.socket.remoteAddress,"변경 전 비밀번호를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
      res.status(500).send("error :" + error2);
    });
});

export = router;
