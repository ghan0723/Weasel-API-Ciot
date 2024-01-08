import PieChartService from '../service/pieChartService';
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();
const pieChartService: PieChartService = new PieChartService();

router.get('/count/:select', (req: Request, res: Response) => {
  const id = req.params.select;
  // console.log('id 이름 :',id);
  pieChartService
    .getPieDataToday(id)
    .then((pieData) => {
      res.send(pieData);
    })
    .catch((error) => {
      console.error('에러 발생: ', error);
      res.status(500).send('fucking');
    });
});

export = router;
