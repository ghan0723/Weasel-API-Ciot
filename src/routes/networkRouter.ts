import UserService from "../service/userService";
import connection from "../db/db";
import NetworkService from "../service/networkService";
import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";


const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();

router.get('/all', (req:Request, res: Response) => {
    let select = req.query.select;
    let username = req.query.username;
    userService.getPrivilegeAndIP(username)
    .then((result) => {
        let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
        networkService.getCountAll(select, ipRange)
        .then((allfiles)=>{
            res.send(allfiles);
        })
        .catch((error) => {
            console.error('에러 발생:', error);
            res.status(500).send('Internal Server Error');
        })  
    })
    .catch((error) => {
        console.error('username을 가져오다가 에러 발생:', error);
        res.status(500).send('Internal Server Error');
    })
})



export = router;