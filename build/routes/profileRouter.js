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
            grade: user[0].grade,
            mng_ip_ranges: user[0].mng_ip_ranges,
            pwd_change_freq: user[0].pwd_change_freq,
        };
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Load Profile Page ");
        res.send([newUser]);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Load Profile Page ");
        console.error("profile failed:", error);
        res.status(500).send("Internal Server Error");
    });
});
router.post("/update/:username", (req, res) => {
    let oldname = req.params.username;
    let user = req.body;
    console.log("user.freq : ", user.freq);
    const encPasswd = cryptoService.getEncryptUltra(user.passwd);
    const newUser = {
        username: user.username,
        passwd: encPasswd,
    };
    userService
        .getGrade(oldname)
        .then((result) => {
        //관리자 계정이 아니라면
        if (result[0].grade !== 1) {
            //중복 사용자가 아닌지 판별
            userService
                .checkUsername(user.username, oldname)
                .then((result) => {
                //중복이다.
                if (result.exists) {
                    log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile By Exist");
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
                                if (user.freq === 3) {
                                    log_1.weasel.log(oldname, req.socket.remoteAddress, "Success to Update Profile ");
                                    res.send(result2.message);
                                }
                                else {
                                    profileService
                                        .updateFreq(user.freq)
                                        .then((result) => {
                                        log_1.weasel.log(oldname, req.socket.remoteAddress, "Success to Update Freq & Profile");
                                        res.send(result.message);
                                    })
                                        .catch((error) => {
                                        log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Freq & Profile ");
                                        res
                                            .status(500)
                                            .send("업데이트 잘못된거 같습니다.");
                                    });
                                }
                            })
                                .catch((error) => {
                                log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile ");
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
                                    log_1.weasel.log(oldname, req.socket.remoteAddress, "Success to Update Profile ");
                                    res.send(result2.message);
                                })
                                    .catch((error) => {
                                    log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile ");
                                    res.status(500).send("업데이트 잘못된거 같습니다.");
                                });
                            })
                                .catch((error) => {
                                log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Pwd Freq");
                                res.status(500).send("업데이트 잘못된거 같습니다.");
                            });
                        }
                    })
                        .catch((error) => {
                        log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Get Pwd By Username ");
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                    });
                }
            })
                .catch((error) => {
                log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Get Profile By Exist");
                res.status(401).send({ error: result.message });
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
                    log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile By Exist");
                    res.status(401).send({ error: result.message });
                }
                else {
                    //중복아님
                    profileService
                        .modUser(newUser, oldname)
                        .then((result2) => {
                        profileService
                            .updateFreq(user.freq)
                            .then((result) => {
                            log_1.weasel.log(oldname, req.socket.remoteAddress, "Success to Update Freq & Profile");
                            res.send(result.message);
                        })
                            .catch((error) => {
                            log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Freq & Profile ");
                            res.status(500).send("업데이트 잘못된거 같습니다.");
                        });
                    })
                        .catch((error) => {
                        log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile ");
                        res.status(500).send("업데이트 잘못된거 같습니다.");
                    });
                }
            })
                .catch((error) => {
                log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Get Profile By Exist");
                res.status(401).send({ error: result.message });
            });
        }
    })
        .catch((error) => {
        log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Get Grade By Username ");
        res.status(500).send("업데이트 잘못된거 같습니다.");
    });
});
module.exports = router;
