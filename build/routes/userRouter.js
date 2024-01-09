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
    userService.getUser(username, passwd)
        .then((user) => {
        // console.log("user(여긴 라우터) :", user);
        res.redirect('http://localhost:3000/admin/default');
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
module.exports = router;
