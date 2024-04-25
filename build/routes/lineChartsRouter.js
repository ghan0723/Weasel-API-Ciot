"use strict";
// import express, { Request, Response, Router } from "express";
// import connection from "../db/db";
// import LineChartsService from "../service/lineChartsService";
// import { IpRange } from "../interface/interface";
// import UserService from "../service/userService";
// import IpCalcService from "../service/ipCalcService";
// const router:Router = express.Router();
// const lineChartsService:LineChartsService = new LineChartsService(connection);
// const userService = new UserService();
// const ipCalcService:IpCalcService = new IpCalcService();
// router.get('/', (req:Request, res:Response) => {
//     const select = req.query.select;     // 일/주/월
//     const username = req.query.username; // 로그인 된 사용자
//     const outlookFlag = req.query.outlookFlag; // outlook 사용
//     let ipRanges:IpRange[];
//     userService.getPrivilegeAndIP(username)
//     .then(result => {
//         let results:Promise<any> | undefined;
//         if(result.length === 0) {
//             return res.status(500).send();
//         }
//         ipRanges = IpCalcService.parseIPRange(result[0].ip_ranges);
//         switch(select) {
//             // 일
//             case 'day' :
//                 results = lineChartsService.getTablesDayData(ipRanges,outlookFlag);
//             break;
//             // 월
//             case 'month' :
//                 results = lineChartsService.getTablesMonthData(ipRanges,outlookFlag);
//             break;
//             // 주
//             default :
//                 results = lineChartsService.getTablesWeekData(ipRanges,outlookFlag);
//             break;
//         }
//         results
//         .then((data) => {
//             res.status(200).send(data);
//         })
//         .catch(() => {
//             res.status(500).send("Data Send Error");
//         });
//     })    
// });
// module.exports = router;
