import express, { Router } from 'express';
import UserController from '../controller/userController';
import UserService from '../service/userService';
import connection from '../db/db';

const router: Router = express.Router();
const userService: UserService = new UserService(connection); // 적절한 방법으로 UserService 인스턴스를 생성해야 합니다.
const userController: UserController = new UserController(userService);

router.post('/login', 
// async (req, res) => {
//     await userController.login(req, res);
// }
userController.login
);

export = router;
