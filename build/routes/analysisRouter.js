"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const average_1 = __importDefault(require("../analysis/average"));
const express_1 = __importDefault(require("express"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const analysisService_1 = __importDefault(require("../service/analysisService"));
const generateRandom_1 = require("../interface/generateRandom");
const router = express_1.default.Router();
const average = new average_1.default();
const analysis = new analysisService_1.default();
const keywordService = new keywordService_1.default();
// keywordList
router.get("/keywordList", (req, res) => {
    keywordService
        .getKeywordList()
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
        console.log(error);
    });
});
router.post("/select", (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    analysis.settingDateAndRange(startDate, endDate).then((result) => {
        const averageResult = average.analyzeFileSize(result);
        res.send(averageResult);
    });
});
router.get('/insert', (req, res) => {
    const detectFiles = (0, generateRandom_1.generateDetectFiles)(100);
    (0, generateRandom_1.insertDetectFiles)(detectFiles);
    res.send("샤샷");
});
module.exports = router;
