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
    lineChartsService.getTablesMonthData()
        .then((data) => {
        // console.log('====================================================================');
        // console.log('networkmonthsCount', data);
        res.status(200).send(data);
    })
        .catch((error) => {
        console.log("data Send Fail");
        res.status(500).send("Data Send Error");
    });
});
module.exports = router;
