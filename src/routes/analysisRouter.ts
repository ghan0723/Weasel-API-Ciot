import ComplexService from "../service/complexService";
import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";

const router:Router = express.Router();
const average: Average = new Average();
const complexService: ComplexService = new ComplexService();


router.get('/average', (req:Request, res:Response) => {
    complexService.getAllData()
    .then((result) => { 
        average.analyzeLeaks(result);
        res.send("바위");
    })
    .catch((error) => {
        console.log("실패...");
    })
});

export = router;