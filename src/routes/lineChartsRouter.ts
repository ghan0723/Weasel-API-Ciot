import express, { Request, Response, Router } from "express";
import connection from "../db/db";
import LineChartsService from "../service/lineChartsService";
import { IpRange } from "../interface/interface";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";


const router:Router = express.Router();
const lineChartsService:LineChartsService = new LineChartsService(connection);
const userService = new UserService();
const ipCalcService:IpCalcService = new IpCalcService();

router.get('/', (req:Request, res:Response) => {
    const select = req.query.select;     // 일/주/월
    const username = req.query.username; // 로그인 된 사용자
    let ipRanges:IpRange[];

    userService.getGradeAndMngip(username)
    .then(result => {
        let results:Promise<any> | undefined;
        ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);

        switch(select) {
            // 일
            case 'day' :
                results = lineChartsService.getTablesDayData(ipRanges);
            break;
            // 월
            case 'month' :
                results = lineChartsService.getTablesMonthData(ipRanges);
            break;
            // 주
            default :
                results = lineChartsService.getTablesWeekData(ipRanges);
            break;
        }
    
        results
        .then((data) => {
            res.status(200).send(data);
        })
        .catch((error) => {
            console.log("data Send Fail");
            res.status(500).send("Data Send Error");
        });
    })    
});
module.exports = router;