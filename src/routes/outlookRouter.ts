import UserService from "../service/userService";
import OutlookService from "../service/outlookService";
import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";


const router: Router = express.Router();
const outlookService: OutlookService = new OutlookService();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();

router.get('/all', (req:Request, res:Response) => {
    let select = req.query.select;
    let username = req.query.username;
    userService
    .getPrivilegeAndIP(username)
    .then((result) => {
      let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
      outlookService
        .getCountAll(select, ipRange)
        .then((allmedias) => {
          res.setHeader('Cache-Control', 'public, max-age=10').send(allmedias);
        })
        .catch((error) => {
          console.error("에러 발생:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("username을 가져오다가 에러 발생:", error);
      res.status(500).send("Internal Server Error");
    });
})

export = router;