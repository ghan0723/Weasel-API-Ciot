"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userService_1 = __importDefault(require("../service/userService"));
const db_1 = __importDefault(require("../db/db"));
const router = express_1.default.Router();
const userService = new userService_1.default(db_1.default);
router.post('/login', (req, res) => {
    const { username, passwd } = req.body;
    userService.getLogin(username, passwd)
        .then((user) => {
        // console.log("user(여긴 라우터) :", user);
        res.redirect('http://localhost:3000/dashboard/default');
    })
        .catch((error) => {
        console.error('Login failed:', error);
        res.status(500).send('Internal Server Error');
    });
});
router.get('/all', (req, res) => {
    userService.getUserList(1)
        .then((userList) => {
        res.status(200).send(userList);
    })
        .catch((error) => {
        console.error('user list 못 가져옴:', error);
        res.status(500).send('Internal Server Error');
    });
});
router.post('/add', (req, res) => {
    const user = req.body;
    userService.addUser(user)
        .then((result) => {
        res.redirect('http://localhost:3000/users/control');
    })
        .catch((error) => {
        console.error('회원가입 실패:', error);
        res.status(500).send('Internal Server Error');
    });
});
router.post('/rm', (req, res) => {
    let users = req.body;
    console.log("삭제할 유저 배열 확인 : ", users);
    userService.removeUser(users)
        .then((result) => {
        res.redirect('http://localhost:3000/users/control');
    })
        .catch((error) => {
        console.error('실패:', error);
        res.status(500).send('Internal Server Error');
    });
});
router.get('/modify/:username', (req, res) => {
    let username = req.params.username;
    console.log("username이 잘 왔니? : ", username);
    userService.getUser(username)
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
        console.error('보내기 실패:', error);
        res.status(500).send('Internal Server Error');
    });
});
router.post('/update/:username', (req, res) => {
    let oldname = req.params.username;
    let user = req.body;
    console.log("변경하고자 하는 유저 : ", oldname);
    console.log("변경 정보 : ", user);
    userService.modUser(user, oldname)
        .then((result) => {
        res.redirect('http://localhost:3000/users/control');
    })
        .catch((error) => {
        console.error('업데이트 실패:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
