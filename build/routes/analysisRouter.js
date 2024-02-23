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
// analysis
router.post("/select", (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const keywords = req.body.keywords;
    const dateRange = analysis.formatPeriod(startDate, endDate);
    console.log("dateRange : ", dateRange);
    console.log('keywords', keywords);
    // 정규식을 사용하여 숫자 값을 추출합니다.
    const matchResult = dateRange.match(/\d+/);
    if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        analysis.settingDateAndRange(startDate, endDate)
            .then((result) => {
            if (dateRange.includes('week')) {
                const averageResult = average.analyzeEventsByWeek(result);
                // patterns
                const patterns = average.analyzePatternsDBSort(result, Object.keys(keywords));
                console.log('patterns', patterns);
                res.send(averageResult);
            }
            else if (dateRange.includes('month')) {
                const averageResult = average.analyzeEventsByMonth(result, numericValue);
                res.send(averageResult);
            }
        });
    }
    else {
        // 숫자 값을 추출할 수 없는 경우에 대한 처리
        res.status(400).send("Unable to extract numeric value from dateRange");
    }
});
router.get('/insert', (req, res) => {
    const detectFiles = (0, generateRandom_1.generateDetectFiles)(100);
    (0, generateRandom_1.insertDetectFiles)(detectFiles);
    res.send("샤샷");
});
module.exports = router;
