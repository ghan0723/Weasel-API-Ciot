import PieChartService from '../service/pieChartService';
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();
const pieChartService: PieChartService = new PieChartService();

router.get('/count', (req: Request, res: Response) => {
  pieChartService
    .getPieDataToday()
    .then((pieData) => {
      res.send(pieData);
    })
    .catch((error) => {
      console.error('에러 발생: ', error);
      res.status(500).send('fucking');
    });
});

export = router;
