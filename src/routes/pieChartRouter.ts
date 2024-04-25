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


});

export = router;
