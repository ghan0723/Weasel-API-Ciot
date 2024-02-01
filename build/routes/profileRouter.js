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
            mng_ip_ranges: user[0].mng_ip_ranges
        };
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Load Profile Page [Profile]");
        res.send([newUser]);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Load Profile Page [Profile]");
        console.error("profile failed:", error);
        res.status(500).send("Internal Server Error");
    });
});
router.post("/update/:username", (req, res) => {
    let oldname = req.params.username;
    let user = req.body;
    const encPasswd = cryptoService.getEncryptUltra(user.passwd);
    const newUser = {
        username: user.username,
        passwd: encPasswd
    };
    userService.checkUsername(user.username, oldname).then((result) => {
        if (result.exists) {
            log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile [Profile]");
            res.status(401).send({ error: result.message });
        }
        else {
            profileService
                .modUser(newUser, oldname)
                .then((result2) => {
                log_1.weasel.log(oldname, req.socket.remoteAddress, "Success to Update Profile [Profile]");
                res.send(result2.message);
            })
                .catch((error) => {
                log_1.weasel.error(oldname, req.socket.remoteAddress, "Failed to Update Profile [Profile]");
                res.status(500).send("업데이트 잘못된거 같습니다.");
            });
        }
    });
});
module.exports = router;
