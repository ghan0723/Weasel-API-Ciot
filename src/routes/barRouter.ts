import { error } from 'console';
import BarService from '../service/barService';
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();
const barService: BarService = new BarService();

router.get('/count', (req: Request, res: Response) => {
    let barData: any[] = [];

    // Function to fetch data for each service
    function fetchData(serviceName: string, index: number) {
        return barService.getBarData(serviceName)
            .then((data) => {
                barData[index] = {
                    name: data.table,
                    data: data.data.map((item: any) => item.totalCount),
                    category: data.data.map((item: any) => item.agentip)
                };
            })
            .catch((error) => {
                console.error('에러 발생: ', error);
                res.status(500).send(`Error fetching data for ${serviceName}`);
                throw error; // rethrow the error to stop further execution
            });
    }

    // Fetch data for each service concurrently
    Promise.all([
        fetchData('network', 0),
        fetchData('media', 1),
        fetchData('outlook', 2),
        fetchData('print', 3)
    ])
    .then(() => {
        console.log("각 서비스 점검 barData : ", barData);
        res.status(200).send(barData);
    })
    .catch((err) => {
        console.error('에러 발생: ', err);
        // If the error has not been handled earlier, send a generic error message
        res.status(500).send('Error fetching data');
    });
});

export = router;
