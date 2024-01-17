"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db/db"));
const lineChartsService_1 = __importDefault(require("../service/lineChartsService"));
const router = express_1.default.Router();
const lineChartsService = new lineChartsService_1.default(db_1.default);
router.get('/', (req, res) => {
    const select = req.query.select; // 일/주/월
    const username = req.query.username; // 로그인 된 사용자
    let results;
    switch (select) {
        // 일
        case 'day':
            results = lineChartsService.getTablesDayData();
            break;
        // 월
        case 'month':
            results = lineChartsService.getTablesMonthData();
            break;
        // 주
        default:
            results = lineChartsService.getTablesMonthData();
            break;
    }
    results
        .then((data) => {
        res.status(200).send(data);
    })
        .catch((error) => {
        console.log("data Send Fail");
        res.status(500).send("Data Send Error");
    });
});
module.exports = router;
