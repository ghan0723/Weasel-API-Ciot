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
    const startDate = req.body.startDate + " 00:00:00";
    const endDate = req.body.endDate + " 23:59:59";
    const keywords = req.body.keywords;
    const dateRange = analysis.formatPeriod(startDate, endDate);
    // 정규식을 사용하여 숫자 값을 추출합니다.
    const matchResult = dateRange.match(/\d+/);
    if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        let patternsResult = {};
        analysis.settingDateAndRange(startDate, endDate)
            .then((result) => {
            analysis.getAgentInfo(startDate, endDate)
                .then((result2) => {
                const agnetInfo = analysis.transformAgentInfo(result2);
                // pattern
                if (Object.keys(keywords).length !== 0) {
                    patternsResult = analysis.analyzePatterns(result, keywords);
                }
                if (dateRange.includes('week')) {
                    const averageResult = average.analyzeEventsByWeek(result);
                    const averageResult2 = average.analyzeFileSizeByWeek(result);
                    const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                    res.send(scoringPoint);
                }
                else if (dateRange.includes('month')) {
                    const averageResult = average.analyzeEventsByMonth(result, numericValue);
                    const averageResult2 = average.analyzeFileSizeByMonth(result, numericValue);
                    const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                    res.send(scoringPoint);
                }
                else if (dateRange.includes('year')) {
                    const averageResult = average.analyzeEventsByYear(result, numericValue);
                    const averageResult2 = average.analyzeFileSizeByMonth(result, 12);
                    const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                    res.send(scoringPoint);
                }
            })
                .catch((error) => {
                res.status(500).send("실패~");
            });
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
// detail
router.post("/detail", (req, res) => {
    const startDate = req.body.startDate + " 00:00:00";
    const endDate = req.body.endDate + " 23:59:59";
    const dateRange = analysis.formatPeriod(startDate, endDate);
    // 정규식을 사용하여 숫자 값을 추출합니다.
    const matchResult = dateRange.match(/\d+/);
    if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        // let patternsResult:{ [pcGuid: string]: number } = {};
        analysis.settingDateAndRange(startDate, endDate)
            .then((result) => {
        });
    }
});
module.exports = router;
