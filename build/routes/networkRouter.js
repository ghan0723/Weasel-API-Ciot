"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const db_1 = __importDefault(require("../db/db"));
const networkService_1 = __importDefault(require("../service/networkService"));
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
router.get('/all', (req, res) => {
    let select = req.query.select;
    let username = req.query.username;
    userService.getPrivilegeAndIP(username)
        .then((result) => {
        let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
        networkService.getCountAll(select, ipRange)
            .then((allfiles) => {
            res.setHeader('Cache-Control', 'public, max-age=10').send(allfiles);
        })
            .catch((error) => {
            console.error('에러 발생:', error);
            res.status(500).send('Internal Server Error');
        });
    })
        .catch((error) => {
        console.error('username을 가져오다가 에러 발생:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
