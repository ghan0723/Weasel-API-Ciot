"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const profileService_1 = __importDefault(require("../service/profileService"));
const express_1 = __importDefault(require("express"));
const cryptoService_1 = __importDefault(require("../service/cryptoService"));
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
        res.send(newUser);
    })
        .catch((error) => {
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
            res.status(401).send({ error: result.message });
        }
        else {
            profileService
                .modUser(newUser, oldname)
                .then((result2) => {
                res.send(result2.message);
            })
                .catch((error) => {
                res.status(500).send("업데이트 잘못된거 같습니다.");
            });
        }
    });
});
module.exports = router;
