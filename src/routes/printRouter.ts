import PrintService from "../service/printService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const printService: PrintService = new PrintService();

router.get('/all/:select', (req:Request, res:Response) => {
    let select = req.params.select;
    printService.getCountAll(select)
    .then((allprints) => {
        res.send(allprints);
    })
    .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');        
    })
})

export = router;