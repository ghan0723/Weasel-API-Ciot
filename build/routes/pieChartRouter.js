"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const pieChartService_1 = __importDefault(require("../service/pieChartService"));
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const router = express_1.default.Router();
const pieChartService = new pieChartService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
router.get('/count/:select', (req, res) => {
    let id = req.params.select;
    let day = req.query.day;
    let username = req.query.username;
});
module.exports = router;
