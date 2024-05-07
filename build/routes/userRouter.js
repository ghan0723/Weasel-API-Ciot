"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userService_1 = __importDefault(require("../service/userService"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const cryptoService_1 = __importDefault(require("../service/cryptoService"));
const ipDomain_1 = require("../interface/ipDomain");
const settingService_1 = __importDefault(require("../service/settingService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const cryptoService = new cryptoService_1.default("sn0ISmjyz1CWT6Yb7dxu");
const settingService = new settingService_1.default();
router.post("/login", (req, res) => {
    const { username, passwd } = req.body;
    userService
        .getLogin(username)
        .then((user) => {
        if (user.length === 0) {
            log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The username '${username}' doesn't exist.`);
            // weasel.log(username, req.socket.remoteAddress, "입력한 아이디가 존재하지 않습니다.");
            // 에러 메시지와 원하는 URL을 포함한 JSON 응답을 보냄
            res.status(401).json({
                error: "사용자를 찾을 수 없습니다",
                redirectUrl: `${ipDomain_1.frontIP}/auth/sign-in`,
            });
            return;
        }
        else {
            userService
                .getPrivilege(username)
                .then((result) => {
                var _a;
                if (result[0].privilege === 1) {
                    let decPasswd = cryptoService.getDecryptUltra(user[0].passwd);
                    settingService
                        .getGUITime()
                        .then((cookieTime) => {
                        if (passwd !== decPasswd) {
                            log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The username '${username}' is not the correct username or password.`);
                            // weasel.log(username,req.socket.remoteAddress,"아이디, 혹은 비밀번호가 맞지 않습니다.");
                            res.status(401).json({
                                error: "비밀번호가 일치하지 않습니다",
                                redirectUrl: `${ipDomain_1.frontIP}/auth/sign-in`,
                            });
                            return;
                        }
                        else {
                            userService
                                .getPopupNotice()
                                .then((popup) => {
                                var _a;
                                if (((_a = popup[0]) === null || _a === void 0 ? void 0 : _a.count) > 0) {
                                    //띄울 팝업이 존재한다면
                                    res.cookie("username", user[0].username, {
                                        secure: true,
                                        maxAge: cookieTime * 1000,
                                        path: "/", // 쿠키의 경로 설정
                                    });
                                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' check the contents of the Sign in successfully popup.`);
                                    // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다 팝업의 내용을 확인해주세요.");
                                    res
                                        .status(200)
                                        .send({ username, freq: false, notice: true, });
                                }
                                else {
                                    //팝업이 존재하지 않는다면
                                    res.cookie("username", user[0].username, {
                                        secure: true,
                                        maxAge: cookieTime * 1000,
                                        path: "/", // 쿠키의 경로 설정
                                    });
                                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' successfully logged in.`);
                                    // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다.");
                                    res
                                        .status(200)
                                        .send({ username, freq: false, notice: false, });
                                }
                            })
                                .catch((error5) => {
                                log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query that queries the popup to the database.`);
                                // weasel.error(username,req.socket.remoteAddress,"팝업을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                res.status(500).send(error5);
                            });
                        }
                    })
                        .catch((error2) => {
                        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query that queried the database for the server's Guitime.`);
                        // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                        res.status(500).send(error2);
                    });
                }
                else {
                    //관리자 제외 나머지 아이디
                    if (((_a = user[0]) === null || _a === void 0 ? void 0 : _a.enabled) !== 1) {
                        log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The user '${username}'s status is not active.`);
                        // weasel.log(username,req.socket.remoteAddress,"사용자 상태가 활성화되지 않았습니다.");
                        res.status(500).send({ enabled: false });
                    }
                    else {
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
                                        if (user[0].fail_count + 1 >= 5) {
                                            log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The user '${username}' temporarily inaccessible because password incorrectly more than five times.`);
                                            // weasel.log(username,req.socket.remoteAddress,"비밀번호를 5회 이상 잘못 입력하여 계정이 일시적으로 접근 불가 상태로 변경됩니다.");
                                        }
                                        else {
                                            log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The user '${username}' incorrect password ${user[0].fail_count + 1} times.`);
                                            // weasel.log(username,req.socket.remoteAddress,"비밀번호를 n회 틀렸습니다.");
                                        }
                                        res.status(401).json({
                                            error: "비밀번호가 일치하지 않습니다",
                                            redirectUrl: `${ipDomain_1.frontIP}/auth/sign-in`,
                                        });
                                    })
                                        .catch((enableError) => {
                                        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while running a query to initialize the number of failed password attempts.`);
                                        // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패 횟수를 초기화하는 쿼리 실행 중 오류가 발생했습니다.");
                                        res.status(401).json({
                                            error: "비밀번호가 일치하지 않습니다",
                                            redirectUrl: `${ipDomain_1.frontIP}/auth/sign-in`,
                                        });
                                        return;
                                    });
                                }
                                else {
                                    if (!freq) {
                                        //로그인 성공했으니까 fail_count 한번 초기화 해주기
                                        userService
                                            .failCountDefault(username)
                                            .then((result4) => {
                                            userService
                                                .getPopupNotice()
                                                .then((popup) => {
                                                var _a;
                                                if (((_a = popup[0]) === null || _a === void 0 ? void 0 : _a.count) > 0) {
                                                    res.cookie("username", user[0].username, {
                                                        secure: true,
                                                        maxAge: cookieTime * 1000,
                                                        path: "/", // 쿠키의 경로 설정
                                                    });
                                                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' check the contents of the Sign in successfully popup.`);
                                                    // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다 팝업의 내용을 확인해주세요.");
                                                    res
                                                        .status(200)
                                                        .send({ username, freq, notice: true, });
                                                }
                                                else {
                                                    res.cookie("username", user[0].username, {
                                                        secure: true,
                                                        maxAge: cookieTime * 1000,
                                                        path: "/", // 쿠키의 경로 설정
                                                    });
                                                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' successfully logged in.`);
                                                    // weasel.log(username,req.socket.remoteAddress,"로그인에 성공하였습니다.");
                                                    res.status(200).send({
                                                        username,
                                                        freq,
                                                        notice: false,
                                                    });
                                                }
                                            })
                                                .catch((error5) => {
                                                log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query that queries the popup to the database.`);
                                                // weasel.error(username, req.socket.remoteAddress, "팝업을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                                res.status(500).send(error5);
                                            });
                                        })
                                            .catch((error5) => {
                                            log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}'  encountered an error while running a query that queried the database for the number of failed password attempts.`);
                                            // weasel.error(username, req.socket.remoteAddress, "비밀번호 입력 실패 횟수를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                            res.status(500).send(error5);
                                        });
                                    }
                                    else {
                                        //freq에 의해 비밀번호를 변경해야 한다
                                        log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' overdue for a password change. Go to the Change password screen`);
                                        // weasel.log(username, req.socket.remoteAddress, "비밀번호 변경 주기가 지났습니다. 비밀번호 변경 화면으로 이동합니다.");
                                        res.status(200).send({ username, freq });
                                    }
                                }
                            })
                                .catch((error3) => {
                                log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query that queries the database for password change intervals.`);
                                // weasel.error(username, req.socket.remoteAddress, "비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                                res.status(500).send(error3);
                            });
                        })
                            .catch((error2) => {
                            log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query that queried the database for the server's Guitime.`);
                            // weasel.error(username, req.socket.remoteAddress, "서버의 Guitime을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                            res.status(500).send(error2);
                        });
                    }
                }
            })
                .catch((error) => {
                log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query to query the database for the rating of the entered ID.`);
                // weasel.error(username, req.socket.remoteAddress, "입력한 아이디의 등급을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
                res.redirect(`${ipDomain_1.frontIP}/auth/sign-in`);
            });
        }
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query to look up the entered ID in the database.`);
        // weasel.error(username, req.socket.remoteAddress, "입력한 아이디를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
        res.redirect(`${ipDomain_1.frontIP}/auth/sign-in`);
    });
});
router.post("/add", (req, res) => {
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
                    log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' username is a duplicate and cannot be created.`);
                    // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 생성할 수 없습니다.");
                    res.status(401).send({ error: '입력한 사용자명이 중복되어 생성할 수 없습니다.' });
                }
                else {
                    let IpRange = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
                    let IpRange2 = ipCalcService_1.default.parseIPRange(user.range);
                    //새로 만든 사용자의 대역이 현재 로그인 한 사용자의 ip 대역을 넘지 않는지 확인
                    userService_1.default.checkIpRange(IpRange2, IpRange).then((result3) => {
                        if (result3.inRange) {
                            //대역을 넘지 않을 때
                            //freq 값 추가
                            userService
                                .getFreq(user.cookie)
                                .then((result) => {
                                userService
                                    .addUser(newUser, result[0].pwd_change_freq)
                                    .then((result4) => {
                                    log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' successfully created a new user account.`);
                                    // weasel.log(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공하였습니다.");
                                    res.send(result4.message);
                                })
                                    .catch((error) => {
                                    log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query to add a new user account to the database.`);
                                    // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정을 데이터베이스에 추가하는 쿼리 실행 중 오류가 발생하였습니다.");
                                    res.status(500).send(error);
                                });
                            })
                                .catch((error) => {
                                log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query that queries the database for the password change interval of the currently logged in user.`);
                                // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                                res.status(500).send(error);
                            });
                        }
                        else {
                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' can't create an account that exceeds the IP band of the user currently logged in.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "현재 로그인 중인 사용자의 IP 대역을 초과하는 계정은 생성할 수 없습니다.");
                            res.status(401).send({ error: result3.message });
                        }
                    });
                }
            })
                .catch((error) => {
                log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query to look up a new username in the database.`);
                // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
            });
        }
        else {
            //관리자로 새로 만들때
            userService.checkUsername(newUser.username).then((result5) => {
                if (result5.exists) {
                    log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' cannot be created because the username entered is a duplicate.`);
                    // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 생성할 수 없습니다.");
                    res.status(401).send({ error: '입력한 사용자명이 중복되어 생성할 수 없습니다.' });
                }
                else {
                    //관리자 계정 freq
                    userService
                        .getFreq(user.cookie)
                        .then((result) => {
                        userService
                            .addUser(newUser, result[0].pwd_change_freq)
                            .then((result4) => {
                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' successfully created a new user account.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정 생성에 성공하였습니다.");
                            res.send(result4.message);
                        })
                            .catch((error) => {
                            log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query to add a new user account to the database.`);
                            // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자 계정을 데이터베이스에 추가하는 쿼리 실행 중 오류가 발생하였습니다.");
                            res.status(500).send(error);
                        });
                    })
                        .catch((error) => {
                        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query that queries the database for the password change interval of the currently logged in user.`);
                        // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 비밀번호 변경 주기를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                        res.status(500).send(error);
                    });
                }
            })
                .catch(() => {
                log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query to look up a new username in the database.`);
                // weasel.error(user.cookie, req.socket.remoteAddress, "새로운 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
            });
        }
    })
        .catch(() => {
        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error executing a query that queries the database for the rating and IP band of the currently logged in user.`);
        // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
        res.status(500).send("이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다.");
    });
});
router.post("/rm", (req, res) => {
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
            let IpRange = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
            if (result[0].privilege !== 1) {
                userService
                    .getUserListByPrivilegeAndIP(result[0].privilege, IpRange, category, searchWord)
                    .then((result2) => {
                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' successfully deleted the user.`);
                    // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공하였습니다.");
                    res.status(200).send(result2);
                })
                    .catch((error2) => {
                    log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' failed to navigate to the Manage Users Menu after deleting a user account.`);
                    // weasel.error(username, req.socket.remoteAddress, "사용자 계정 삭제 이후 사용자 관리 메뉴로 이동에 실패하였습니다.");
                    res.status(500).send("Internal Server Error");
                });
            }
            else {
                userService
                    .getUserListAll(category, searchWord, result[0].id, IpRange)
                    .then((result) => {
                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' successfully deleted the user.`);
                    // weasel.log(username, req.socket.remoteAddress, "사용자 삭제를 성공하였습니다.");
                    res.send(result);
                })
                    .catch((error) => {
                    log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' failed to navigate to the Manage Users Menu after deleting a user account.`);
                    // weasel.error(username, req.socket.remoteAddress, "사용자 계정 삭제 이후 사용자 관리 메뉴로 이동에 실패하였습니다.");
                    res.status(500).send("Internal Server Error");
                });
            }
        })
            .catch((error) => {
            log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while running a query that queries the database for the rating and IP band of the currently logged in user.`);
            // weasel.error(username, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
            res.status(500).send("Internal Server Error");
        });
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while executing a query to delete the user account to the database.`);
        // weasel.error(username, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 삭제하는 쿼리 실행 중 오류가 발생하였습니다.");
        res.status(500).send("Internal Server Error");
    });
});
router.get("/modify/:username", (req, res) => {
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
        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' failed to navigate to the Edit User menu.`);
        // weasel.error(username, req.socket.remoteAddress, "사용자 수정 메뉴로 이동에 실패하였습니다.");
        res.status(500).send("Internal Server Error");
    });
});
router.post("/update/:username", (req, res) => {
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
                log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' cannot be changed because the username entered is a duplicate.`);
                // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다. ");
                res.status(401).send({ error: result.message });
            }
            else {
                // 관리자 계정이 아닐 때
                if (result1[0].privilege !== 1) {
                    let IpRange = ipCalcService_1.default.parseIPRange(result1[0].ip_ranges);
                    let IpRange2 = ipCalcService_1.default.parseIPRange(user.mngRange);
                    userService_1.default
                        .checkIpRange(IpRange2, IpRange)
                        .then((result3) => {
                        if (result3.inRange) {
                            //영역별 관리자가 업데이트 할 때 해당 계정의 비밀번호가 변경 되는지 확인
                            userService.getPwdByUsername(oldname).then((result) => {
                                const decOldPwd = cryptoService.getDecryptUltra(result[0].passwd);
                                if (decOldPwd === user.passwd) {
                                    //변경이 안됨 => 주기 초기화 해줄 필요 없음
                                    userService
                                        .modUser(newUser, oldname)
                                        .then((result4) => {
                                        log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' modification was successful.`);
                                        // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                        res.send(result4.message);
                                    })
                                        .catch((error) => {
                                        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while executing a query to change user accounts in the database.`);
                                        // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
                                        res.status(500).send("Internal Server Error");
                                    });
                                }
                                else {
                                    //변경됨 => 한번 주기 초기화 해줘야함
                                    userService
                                        .modUser(newUser, oldname)
                                        .then((result4) => {
                                        userService
                                            .modifyPwdByFreq(user.username, encPasswd)
                                            .then((result) => {
                                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' modification was successful.`);
                                            // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                            res.send(result4.message);
                                        })
                                            .catch((error) => {
                                            log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' failed to renew the password change cycle for the changed user account.`);
                                            // weasel.error(user.cookie, req.socket.remoteAddress, "변경한 사용자 계정의 비밀번호 변경 주기를 갱신하는데 실패하였습니다.");
                                            res.status(500).send("Internal Server Error");
                                        });
                                    })
                                        .catch((error) => {
                                        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while executing a query to change user accounts in the database.`);
                                        // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
                                        res.status(500).send("Internal Server Error");
                                    });
                                }
                            });
                        }
                        else {
                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' can't change to an account that exceeds the IP band of the user currently logged in.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "현재 로그인 중인 사용자의 IP 대역을 초과하는 계정으로 변경할 수 없습니다.");
                            res.status(401).send({ error: result3.message });
                        }
                    });
                }
                else {
                    //관리자일 때
                    userService
                        .checkUsername(user.username, oldname)
                        .then((result) => {
                        if (result.exists) {
                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Warn] The user '${user.cookie}' cannot be changed because the username entered is a duplicate.`);
                            // weasel.log(user.cookie, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다. ");
                            res.status(401).send({ error: result.message });
                        }
                        else {
                            //관리자 계정으로 업데이트할 때 해당 계정의 비밀번호가 변경되는지 확인
                            userService.getPwdByUsername(oldname).then((result) => {
                                const decOldPwd = cryptoService.getDecryptUltra(result[0].passwd);
                                if (decOldPwd === user.passwd) {
                                    //변경이 안됨 => 주기 초기화 해줄 필요 없음
                                    userService
                                        .modUser(newUser, oldname, user.enabled)
                                        .then((result4) => {
                                        log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' modification was successful.`);
                                        // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                        res.send(result4.message);
                                    })
                                        .catch(() => {
                                        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while executing a query to change user accounts in the database.`);
                                        // weasel.error(user.cookie, req.socket.remoteAddress, "사용자 계정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
                                        res.status(500).send("Internal Server Error");
                                    });
                                }
                                else {
                                    //변경됨 => 한번 주기 초기화 해줘야함
                                    userService
                                        .modUser(newUser, oldname, user.enabled)
                                        .then((result4) => {
                                        userService
                                            .modifyPwdByFreq(user.username, encPasswd)
                                            .then((result) => {
                                            log_1.weasel.log(user.cookie, req.socket.remoteAddress, `[Info] The user '${user.cookie}' modification was successful.`);
                                            // weasel.log(user.cookie, req.socket.remoteAddress, "사용자 수정을 성공하였습니다.");
                                            res.send(result4.message);
                                        })
                                            .catch((error) => {
                                            log_1.weasel.error(user.username, req.socket.remoteAddress, `[Error] The user '${user.cookie}' failed to renew the password change cycle for the changed user account.`);
                                            // weasel.error(user.username, req.socket.remoteAddress, "변경한 사용자 계정의 비밀번호 변경 주기를 갱신하는데 실패하였습니다.");
                                            res.status(500).send("Internal Server Error");
                                        });
                                    })
                                        .catch((error) => {
                                        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while executing a query to change user accounts in the database.`);
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
            log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while executing the query to query the database for the username to change.`);
            // weasel.error(user.cookie, req.socket.remoteAddress, "변경할 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
            res.status(500).send("이거는 중복을 검사하는 도중에 발생하는 에러입니다.");
        });
    })
        .catch((error2) => {
        log_1.weasel.error(user.cookie, req.socket.remoteAddress, `[Error] The user '${user.cookie}' encountered an error while running a query that queries the database for the rating and IP band of the currently logged in user.`);
        // weasel.error(user.cookie, req.socket.remoteAddress, "현재 로그인한 사용자의 등급과 IP 대역을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
        res.status(500).send("이거는 쿠키 가지고 privilege랑 mngip 가져오는 도중에 발생하는 에러입니다.");
    });
});
router.get("/namecookie", (req, res) => {
    let username = req.cookies.username;
    if (username !== undefined && username !== null) {
        res.json({ username: username });
    }
    else {
        res.status(500).send({ username });
    }
});
router.get("/privilege", (req, res) => {
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
router.get("/all", (req, res) => {
    let username = req.query.username;
    let category = req.query.category;
    let searchWord = req.query.searchWord;
    userService
        .getIdAndPriAndIp(username)
        .then((result) => {
        let IpRange = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
        if (result[0].privilege !== 1) {
            userService
                .getUserListByPrivilegeAndIP(result[0].privilege, IpRange, category, searchWord)
                .then((result2) => {
                if (result2[0]) {
                    res.send(result2);
                }
                else {
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
        }
        else {
            //관리자
            userService
                .getUserListAll(category, searchWord, result[0].id, IpRange)
                .then((result) => {
                if (result[0]) {
                    res.send(result);
                }
                else {
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
router.get("/check", (req, res) => {
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
router.post("/pwd", (req, res) => {
    let username = req.query.username;
    let user = req.body;
    const encPwd = cryptoService.getEncryptUltra(user.newPwd);
    userService
        .getPwdByUsername(username)
        .then((result1) => {
        const decOldPwd = cryptoService.getDecryptUltra(result1[0].passwd);
        if (user.oldPwd !== decOldPwd) {
            log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The user '${username}' the password incorrectly before changing it.`);
            // weasel.log(username,req.socket.remoteAddress,"변경 전 비밀번호를 잘못 입력하였습니다.");
            res.status(401).send("fail");
        }
        else {
            if (user.newPwd !== user.oldPwd) {
                userService
                    .modifyPwdByFreq(username, encPwd)
                    .then((result2) => {
                    log_1.weasel.log(username, req.socket.remoteAddress, `[Info] The user '${username}' successfully changed account password.`);
                    // weasel.log(username,req.socket.remoteAddress,"계정 비밀번호 변경을 성공했습니다.");
                    res.status(200).send(result2);
                })
                    .catch((error) => {
                    log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' Password cycle renewal failed.`);
                    // weasel.error(username,req.socket.remoteAddress,"비밀번호 주기를 새로 갱신하는데 실패하였습니다.");
                    res.status(500).send("Internal Server Error");
                });
            }
            else {
                log_1.weasel.log(username, req.socket.remoteAddress, `[Warn] The user '${username}' sees that the new password they entered matches their existing password.`);
                // weasel.log(username,req.socket.remoteAddress,"입력한 새 비밀번호가 기존의 비밀번호와 일치합니다.");
                res.status(403).send({
                    error: "입력한 새 비밀번호가 기존의 비밀번호와 일치합니다."
                });
            }
        }
    })
        .catch((error2) => {
        log_1.weasel.error(username, req.socket.remoteAddress, `[Error] The user '${username}' encountered an error while running a query to query the database for the password before the change.`);
        // weasel.error(username,req.socket.remoteAddress,"변경 전 비밀번호를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
        res.status(500).send("error :" + error2);
    });
});
module.exports = router;
