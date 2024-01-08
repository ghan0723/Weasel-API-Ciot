"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const pieChartService_1 = __importDefault(require("../service/pieChartService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const pieChartService = new pieChartService_1.default();
router.get('/count/:select', (req, res) => {
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
module.exports = router;
