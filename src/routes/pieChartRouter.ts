import UserService from '../service/userService';
import PieChartService from '../service/pieChartService';
import express, { Request, Response, Router } from 'express';
import IpCalcService from '../service/ipCalcService';

const router: Router = express.Router();
const pieChartService: PieChartService = new PieChartService();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();

router.get('/count/:select', (req: Request, res: Response) => {
  let id = req.params.select;
  let day = req.query.day;
  let username = req.query.username;

  userService.getPrivilegeAndIP(username)
    .then((result) => {
        let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
        pieChartService
        .getPieDataToday(id, day, ipRange)
        .then((pieData) => {
          res.send(pieData);
        })
        .catch((error) => {
          console.error('에러 발생: ', error);
          res.status(500).send('fucking');
        }); 
    })
    .catch((error) => {
        console.error('username을 가져오다가 에러 발생:', error);
        res.status(500).send('Internal Server Error');
    })
});

export = router;
