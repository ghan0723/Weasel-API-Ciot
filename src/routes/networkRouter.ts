import connection from "../db/db";
import NetworkService from "../service/networkService";
import express, { Request, Response, Router } from "express";


const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);

router.get('/all', (req:Request, res: Response) => {
    networkService.getCountAll()
    .then((allfiles)=>{
        console.log("allfiles : ", allfiles);
        res.send(allfiles);
    })
    .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');
    })
})

export = router;