"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const complexService_1 = __importDefault(require("../service/complexService"));
const average_1 = __importDefault(require("../analysis/average"));
const express_1 = __importDefault(require("express"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const router = express_1.default.Router();
const average = new average_1.default();
const complexService = new complexService_1.default();
const keywordService = new keywordService_1.default();
router.get('/average', (req, res) => {
    complexService.getAllData()
        .then((result) => {
        average.analyzeLeaks(result);
        res.send("바위");
    })
        .catch((error) => {
        console.log("실패...");
    });
});
// keywordList
router.get('/keywordList', (req, res) => {
    keywordService.getKeywordList()
        .then(result => {
        res.send(result);
    })
        .catch(error => {
        console.log(error);
    });
});
module.exports = router;
