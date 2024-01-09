import OutlookService from "../service/outlookService";
import express, { Request, Response, Router } from "express";


const router: Router = express.Router();
const outlookService: OutlookService = new OutlookService();

router.get('/all', (req:Request, res:Response) => {
    outlookService.getCountAll()
    .then((alloutlooks) => {
        res.send(alloutlooks);
    })
    .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');        
    })
})

export = router;