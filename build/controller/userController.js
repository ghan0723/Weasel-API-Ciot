"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipDomain_1 = require("../interface/ipDomain");
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    login(req, res) {
        const { username, password } = req.body;
        this.userService.getLogin(username)
            .then((user) => {
            // console.log("user(여긴 컨트롤러) :", user);
            res.redirect(`${ipDomain_1.frontIP}/admin/default`);
        })
            .catch((error) => {
            console.error('Login failed:', error);
            res.status(500).send('Internal Server Error');
        });
    }
}
exports.default = UserController;
// import { Request, Response } from "express";
// import UserService from "../service/userService";
// class UserController {
//     private userService: UserService;
//     constructor(userService: UserService) {
//         this.userService = userService;
//     }
//     login(req: Request, res: Response, callback: (error: any, user: any) => void) {
//         const { username, password }: { username: string; password: string } = req.body;
//         this.userService.getUser(username, password)
//             .then((user) => {
//                 callback(null, user);
//             })
//             .catch((error) => {
//                 callback(error, null);
//             });
//     }
// }
// export default UserController;
