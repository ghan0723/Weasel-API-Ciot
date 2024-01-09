import express, { Request, Response, Router } from 'express';
import UserService from '../service/userService';
import connection from '../db/db';

const router: Router = express.Router();
const userService: UserService = new UserService(connection);

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

router.get('/all', (req:Request, res:Response) => {
    userService.getUserList(1)
    .then((userList) => {
        res.status(200).send(userList);
    })
    .catch((error) => {
        console.error('user list 못 가져옴:', error);
        res.status(500).send('Internal Server Error');
    })
})

export = router;