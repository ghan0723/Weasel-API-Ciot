"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const db_1 = __importDefault(require("../db/db"));
const networkService_1 = __importDefault(require("../service/networkService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
router.get('/all', (req, res) => {
    networkService.getCountAll()
        .then((allfiles) => {
        console.log("allfiles : ", allfiles);
        res.send(allfiles);
    })
        .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
