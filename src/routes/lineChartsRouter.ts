import express, { Request, Response, Router } from "express";
import connection from "../db/db";
import LineChartsService from "../service/lineChartsService";


const router:Router = express.Router();
const lineChartsService:LineChartsService = new LineChartsService(connection);

router.get('/', (req:Request, res:Response) => {
    const select = req.query.select;     // 일/주/월
    const username = req.query.username; // 로그인 된 사용자
    let results:Promise<any> | undefined;

    switch(select) {
        // 일
        case 'day' :
            results = lineChartsService.getTablesDayData();
        break;
        // 월
        case 'month' :
            results = lineChartsService.getTablesMonthData();
        break;
        // 주
        default :
            results = lineChartsService.getTablesMonthData();
        break;
    }

    results
    .then((data) => {
        res.status(200).send(data);
    })
    .catch((error) => {
        console.log("data Send Fail");
        res.status(500).send("Data Send Error");
    })
    
});
module.exports = router;