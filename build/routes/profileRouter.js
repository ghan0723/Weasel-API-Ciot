"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const profileService_1 = __importDefault(require("../service/profileService"));
const express_1 = __importDefault(require("express"));
const cryptoService_1 = __importDefault(require("../service/cryptoService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const profileService = new profileService_1.default();
const userService = new userService_1.default();
const cryptoService = new cryptoService_1.default("sn0ISmjyz1CWT6Yb7dxu");
router.get("/edit/:username", (req, res) => {
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
        log_1.weasel.log(username, req.socket.remoteAddress, `[INFO] [ProfileService] - User '${username}' accesses the Edit personal information menu.`);
        // weasel.log(username, req.socket.remoteAddress, "본인정보수정 메뉴로 이동하였습니다.");
        res.send([newUser]);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${username}' Failed to navigate to the Edit Personal Information menu.`);
        // weasel.error(username, req.socket.remoteAddress, "본인정보수정 메뉴로 이동에 실패하였습니다.");
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
                    log_1.weasel.log(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' The username is a duplicate and can't be changed.`);
                    // weasel.log(oldname, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다.");
                    res.status(401).send({ error: result.message });
                }
                else {
                    //아닐 경우 일단 비밀번호가 변경 되었는지 확인
                    userService
                        .getPwdByUsername(oldname)
                        .then((pwd) => {
                        const decOldPwd = cryptoService.getDecryptUltra(pwd[0].passwd);
                        //이전 비밀번호와 동일
                        if (user.passwd === decOldPwd) {
                            profileService
                                .modUser(newUser, oldname)
                                .then((result2) => {
                                log_1.weasel.log(oldname, req.socket.remoteAddress, `[INFO] [ProfileService] - User '${oldname}' successfully edited '${oldname}' information.`);
                                // weasel.log(oldname, req.socket.remoteAddress, "본인정보수정에 성공하였습니다.");
                                res.send(result2.message);
                            })
                                .catch(() => {
                                log_1.weasel.error(oldname, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${oldname}'  Failed to edit information.`);
                                // weasel.error(oldname, req.socket.remoteAddress,"본인정보수정에 실패하였습니다.");
                                res.status(500).send("업데이트 잘못된거 같습니다.");
                            });
                        }
                        else {
                            //비밀번호가 변경되었다면 갱신주기 업데이트 이후 변경
                            userService
                                .modifyPwdByFreq(oldname, encPasswd)
                                .then((result) => {
                                profileService
                                    .modUser(newUser, oldname)
                                    .then((result2) => {
                                    log_1.weasel.log(oldname, req.socket.remoteAddress, `[INFO] [ProfileService] - User '${oldname}' successfully edited '${oldname}' information.`);
                                    // weasel.log(oldname, req.socket.remoteAddress, "본인정보수정에 성공하였습니다.");
                                    res.send(result2.message);
                                })
                                    .catch((error) => {
                                    log_1.weasel.error(oldname, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${oldname}'  Failed to edit information.`);
                                    // weasel.error(oldname, req.socket.remoteAddress, "본인정보수정에 실패하였습니다.");
                                    res.status(500).send("업데이트 잘못된거 같습니다.");
                                });
                            })
                                .catch((error) => {
                                log_1.weasel.error(oldname, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${oldname}' An error occurred while executing a query to reset the password change cycle in Edit Profile.`);
                                // weasel.error(oldname, req.socket.remoteAddress, "본인정보수정에서 비밀번호 변경 주기 초기화하는 쿼리 실행 중 오류가 발생하였습니다.");
                                res.status(500).send("업데이트 잘못된거 같습니다.");
                            });
                        }
                    })
                        .catch(() => {
                        log_1.weasel.error(oldname, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${oldname}' There was an error executing a query to the database for a password in Edit Profile.`);
                        // weasel.error(oldname, req.socket.remoteAddress, "본인정보수정에서 비밀번호를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                    });
                }
            })
                .catch(() => {
                log_1.weasel.error(oldname, req.socket.remoteAddress, `[ERROR] [ProfileService] - User '${oldname}' An error occurred while executing a query to the database to query the username to be changed in Edit Profile.`);
                // weasel.error(oldname,req.socket.remoteAddress, "본인정보수정에서 변경할 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                res.status(401).send({ error: result1.message });
            });
        }
        else {
            //관리자 계정일때
            //중복 사용자가 아닌지 판별
            userService
                .checkUsername(user.username, oldname)
                .then((result) => {
                //중복
                if (result.exists) {
                    log_1.weasel.log(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' The username is a duplicate and can't be changed.`);
                    // weasel.log(oldname, req.socket.remoteAddress, "입력한 사용자명이 중복되어 변경할 수 없습니다.");
                    res.status(401).send({ error: result.message });
                }
                else {
                    //중복아님
                    profileService
                        .modUser(newUser, oldname)
                        .then(() => {
                        profileService
                            .updateFreq(user.freq)
                            .then((result) => {
                            log_1.weasel.log(oldname, req.socket.remoteAddress, `[INFO] [ProfileService] - User '${oldname}' successfully edited '${oldname}' information.`);
                            // weasel.log(oldname, req.socket.remoteAddress, "본인정보수정에 성공하였습니다.");
                            res.send(result.message);
                        })
                            .catch(() => {
                            log_1.weasel.error(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' An error occurred while executing a query to set the password change frequency value for an administrator in Edit Profile.`);
                            // weasel.error(oldname, req.socket.remoteAddress,"본인정보수정에서 관리자가 비밀번호 변경 주기 값 설정하는 쿼리 실행 중 오류가 발생하였습니다.");
                            res.status(500).send("업데이트 잘못된거 같습니다.");
                        });
                    })
                        .catch(() => {
                        log_1.weasel.error(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' Failed to edit information.`);
                        // weasel.error(oldname, req.socket.remoteAddress, "본인정보수정에 실패하였습니다.");
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                    });
                }
            })
                .catch(() => {
                log_1.weasel.error(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' An error occurred while executing a query to the database to query the username to be changed in Edit Profile.`);
                // weasel.error(oldname,req.socket.remoteAddress, "본인정보수정에서 변경할 사용자명을 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
                res.status(401).send({ error: result1.message });
            });
        }
    })
        .catch(() => {
        log_1.weasel.error(oldname, req.socket.remoteAddress, `[WARN] [ProfileService] - User '${oldname}' An error occurred while executing a query to the database for the currently logged in account information in Edit Profile.`);
        // weasel.error(oldname, req.socket.remoteAddress, "본인정보수정에서 현재 로그인한 계정 정보를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다. ");
        res.status(500).send("업데이트 잘못된거 같습니다.");
    });
});
module.exports = router;
