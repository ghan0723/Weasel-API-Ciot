import { Request, Response } from "express";
import UserService from "../service/userService";

class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    login(req: Request, res: Response): void {
        const { username, passwd }: { username: string; passwd: string } = req.body;

        this.userService.getUser(username, passwd)
            .then((user) => {
                console.log("user(여긴 컨트롤러) :", user);
                res.redirect('http://localhost:3000/admin/default');
            })
            .catch((error) => {
                console.error('Login failed:', error);
                res.status(500).send('Internal Server Error');
            });
    }
}

export default UserController;
// import { Request, Response } from "express";
// import UserService from "../service/userService";

// class UserController {
//     private userService: UserService;

//     constructor(userService: UserService) {
//         this.userService = userService;
//     }

//     login(req: Request, res: Response, callback: (error: any, user: any) => void) {
//         const { username, passwd }: { username: string; passwd: string } = req.body;

//         this.userService.getUser(username, passwd)
//             .then((user) => {
//                 callback(null, user);
//             })
//             .catch((error) => {
//                 callback(error, null);
//             });
//     }
// }

// export default UserController;
