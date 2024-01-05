import express, { Request, Response, Router } from "express";
import connection from "../db/db";
import LineChartsService from "../service/lineChartsService";


const router:Router = express.Router();
const lineChartsService:LineChartsService = new LineChartsService(connection);

router.get('/', (req:Request, res:Response) => {
    lineChartsService.getTablesYearData()
    .then((data) => {
        console.log('====================================================================');
        console.log('networkmonthsCount', data);
        
        res.status(200).send(data);
    })
    .catch((error) => {
        console.log("data Send Fail");
        res.status(500).send("Data Send Error");
    })
    
});
module.exports = router;