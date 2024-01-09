"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const barService_1 = __importDefault(require("../service/barService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const barService = new barService_1.default();
router.get('/count/:select', (req, res) => {
    let param = req.params.select;
    let barData = [];
    // Function to fetch data for each service
    function fetchData(serviceName, index) {
        return barService.getBarData(serviceName, param)
            .then((data) => {
            barData[index] = {
                name: data.table,
                data: data.data.map((item) => item.totalCount),
                category: data.data.map((item) => item.agentip)
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
        res.status(200).send(barData);
    })
        .catch((err) => {
        console.error('에러 발생: ', err);
        // If the error has not been handled earlier, send a generic error message
        res.status(500).send('Error fetching data');
    });
});
module.exports = router;
