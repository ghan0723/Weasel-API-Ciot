import { Request, Response } from "express";
import UserService from "../service/userService";


class UserController {
    private userService: UserService;

    constructor(userService:UserService) {
        this.userService = userService;
    }

    async login(req: Request, res: Response) {
        try {
            const { username, passwd }: { username: string; passwd: string } = req.body;

            const user = await this.userService.getUser(username, passwd);

            console.log("user(여긴 컨트롤러) :",user);
            
            res.redirect('http://localhost:3000/admin/default');
        } catch (error) {
            console.error('Login failed:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default UserController;