"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const profileService_1 = __importDefault(require("../service/profileService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const profileService = new profileService_1.default();
const userService = new userService_1.default();
router.get("/edit/:username", (req, res) => {
    let username = req.params.username;
    profileService
        .getProfile(username)
        .then((user) => {
        res.send(user);
    })
        .catch((error) => {
        console.error("profile failed:", error);
        res.status(500).send("Internal Server Error");
    });
});
router.post("/update/:username", (req, res) => {
    let oldname = req.params.username;
    let user = req.body;
    userService.checkUsername(user.username, oldname).then((result) => {
        if (result.exists) {
            res.status(401).send({ error: result.message });
        }
        else {
            profileService
                .modUser(user, oldname)
                .then((result2) => {
                // 기존 쿠키 삭제
                res.clearCookie("username");
                // 새로운 쿠키 설정
                res.cookie("username", user.username, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                    path: "/", // 쿠키의 경로 설정
                });
                res.send(result2.message);
            })
                .catch((error) => {
                res.status(500).send("업데이트 잘못된거 같습니다.");
            });
        }
    });
});
module.exports = router;
