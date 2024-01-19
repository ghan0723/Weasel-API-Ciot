import SettingService from '../service/settingService';
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();
const settingService: SettingService = new SettingService();

router.post('/server', (req:Request, res:Response) => {
    const server = req.body;
    console.log("server 잘 들어왔나 ?  : ", server);
    res.send("잘 들어왔습니다.");
})

export = router;