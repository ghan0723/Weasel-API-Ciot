import express, { Request, Response, Router } from 'express';
import UserController from '../controller/userController';
import UserService from '../service/userService';
import connection from '../db/db';

const router: Router = express.Router();
const userService: UserService = new UserService(connection);
const userController: UserController = new UserController(userService);

router.post('/login', (req: Request, res: Response) => {
    const { username, passwd }: { username: string; passwd: string } = req.body;

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

export = router;

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
