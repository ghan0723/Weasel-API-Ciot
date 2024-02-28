"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const average_1 = __importDefault(require("../analysis/average"));
const express_1 = __importDefault(require("express"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const analysisService_1 = __importDefault(require("../service/analysisService"));
const generateRandom_1 = require("../interface/generateRandom");
const detail_1 = __importDefault(require("../analysis/detail"));
const router = express_1.default.Router();
const average = new average_1.default();
const analysis = new analysisService_1.default();
const keywordService = new keywordService_1.default();
const detail = new detail_1.default();
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
    analysis.riskScoring(startDate, endDate, keywords)
        .then(result => {
        res.send(result);
    })
        .catch(error => {
        console.log('error', error);
        res.status(error.status).send(error.error);
    });
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
    const pc_guid = req.body.pc_guid;
    const dateRange = analysis.formatPeriod(startDate, endDate);
    const resultValues = [];
    console.log('startDate', startDate);
    console.log('endDate', endDate);
    console.log('dateRange', dateRange);
    // 정규식을 사용하여 숫자 값을 추출합니다.
    const matchResult = dateRange.match(/\d+/);
    if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        analysis.settingDateAndRange(startDate, endDate, pc_guid)
            .then((result) => {
            detail.getAnalysisLineDateByPcGuid(pc_guid, dateRange, startDate, endDate, numericValue)
                .then((result2) => {
                detail.getCountFileSize(pc_guid, dateRange, startDate, endDate, numericValue)
                    .then((result3) => {
                    const patternResult = analysis.analyzeDetailPatterns(result, pc_guid);
                    resultValues.push(patternResult);
                    resultValues.push(result2);
                    resultValues.push(result3);
                    resultValues.push({ startDate, endDate });
                    res.send({ result: resultValues });
                })
                    .catch((error3) => {
                    res.status(400).send("Detail file size fail");
                });
            })
                .catch((error2) => {
                res.status(400).send("Unable to extract numeric value from dateRange Detail");
            });
        });
    }
    else {
        // 숫자 값을 추출할 수 없는 경우에 대한 처리
        res.status(400).send("Unable to extract numeric value from dateRange Detail");
    }
});
module.exports = router;
