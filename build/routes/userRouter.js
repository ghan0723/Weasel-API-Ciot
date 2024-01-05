"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controller/userController"));
const userService_1 = __importDefault(require("../service/userService"));
const db_1 = __importDefault(require("../db/db"));
const router = express_1.default.Router();
const userService = new userService_1.default(db_1.default);
const userController = new userController_1.default(userService);
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
module.exports = router;
// import express, { Router, Request, Response } from 'express';
// import UserController from '../controller/userController';
// import UserService from '../service/userService';
// import connection from '../db/db';
// const router: Router = express.Router();
// const userService: UserService = new UserService(connection);
// const userController: UserController = new UserController(userService);
// router.post('/login', (req: Request, res: Response) => {
//     userController.login(req, res, (error, user) => {
//         if (error) {
//             console.error('Login failed:', error);
//             res.status(500).send('Internal Server Error');
//         } else {
//             console.log("user(여긴 라우터) :", user);
//             res.redirect('http://localhost:3000/admin/default');
//         }
//     });
// });
// export = router;
