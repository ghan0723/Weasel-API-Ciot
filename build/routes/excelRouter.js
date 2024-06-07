"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const userService_1 = __importDefault(require("../service/userService"));
const db_1 = __importDefault(require("../db/db"));
const mediaService_1 = __importDefault(require("../service/mediaService"));
const networkService_1 = __importDefault(require("../service/networkService"));
const outlookService_1 = __importDefault(require("../service/outlookService"));
const printService_1 = __importDefault(require("../service/printService"));
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const excelService_1 = __importDefault(require("../service/excelService"));
const leakedService_1 = __importDefault(require("../service/leakedService"));
const analysisService_1 = __importDefault(require("../service/analysisService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const mediaService = new mediaService_1.default();
const outlookService = new outlookService_1.default();
const printService = new printService_1.default();
const leakedService = new leakedService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const excelService = new excelService_1.default();
const analysis = new analysisService_1.default();
router.get("/dwn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const contents = req.query.contents;
    try {
        const page = req.query.page;
        const pageSize = req.query.pageSize;
        const sorting = req.query.sorting;
        const desc = req.query.desc;
        const category = req.query.category;
        const search = req.query.search;
        const result = yield userService.getPrivilegeAndIP(username);
        const ipRanges = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
        let results;
        if (contents === "network") {
            results = yield networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege, true);
        }
        else if (contents === "media") {
            results = yield mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege, true);
        }
        else if (contents === "outlook") {
            results = yield outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege, true);
        }
        else if (contents === "print") {
            results = yield printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege, true);
        }
        else if (contents === "leaked") {
            results = yield leakedService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, true);
        }
        else {
            res.status(400).send("Invalid param");
            return;
        }
        if (!results) {
            res.status(404).send("No data found");
            return;
        }
        const keys = Object.keys(results[0][0]);
        if (keys.includes('id')) {
            for (let i = 0; i < results[0].length; i++) {
                delete results[0][i].id;
            }
        }
        const excelBuffer = yield excelService.getExcelFile(results[0], `${contents}`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${contents}.xlsx`);
        res.send(excelBuffer);
        log_1.weasel.log(username, req.ip, `[Info] The user, '${username}' downloaded the Excel file of ${contents}.`);
        // weasel.log(username,req.ip,`${contents}의 액셀 파일을 다운로드 하였습니다.`);
    }
    catch (error) {
        log_1.weasel.error(username, req.ip, `[Error] The user, '${username}' download of the excel file in ${contents} fail.`);
        // weasel.error(username, req.ip, `${contents}의 엑셀 파일을 다운로드하는데 실패하였습니다.`);
        res.status(500).send("Server error");
    }
}));
router.post("/analytics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    try {
        const startDate = req.body.startDate + " 00:00:00";
        const endDate = req.body.endDate + " 23:59:59";
        const keywords = req.body.keywords;
        userService.getPrivilegeAndIP(username)
            .then((result1) => __awaiter(void 0, void 0, void 0, function* () {
            const ipRanges = ipCalcService_1.default.parseIPRange(result1[0].ip_ranges);
            const results = yield analysis.riskScoring(startDate, endDate, keywords, ipRanges);
            for (let i = 0; i < results.length; i++) {
                results[i]["PC명(IP주소)"] = results[i]["pcName"];
                if (results[i]["level"] === 1) {
                    results[i]["등급"] = "관심";
                }
                else if (results[i]["level"] === 2) {
                    results[i]["등급"] = "주의";
                }
                else if (results[i]["level"] === 3) {
                    results[i]["등급"] = "경고";
                }
                else if (results[i]["level"] === 4) {
                    results[i]["등급"] = "심각";
                }
                else {
                    results[i]["등급"] = "매우 심각";
                }
                results[i]["위험도 수치"] = results[i]["status"];
                results[i]["설명"] = results[i]["text"];
                delete results[i].pcGuid;
                delete results[i].progress;
                delete results[i].pcName;
                delete results[i].level;
                delete results[i].status;
                delete results[i].text;
            }
            if (!results) {
                res.status(404).send("No data found");
                return;
            }
            const excelBuffer = yield excelService.getExcelFile(results, "analytics");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=analytics.xlsx`);
            res.send(excelBuffer);
            log_1.weasel.log(username, req.ip, `[Info] The user, '${username}' downloaded the excel file of the analysis.`);
            // weasel.log(username,req.ip,"분석의 엑셀 파일을 다운로드 하였습니다.");
        }));
    }
    catch (error) {
        log_1.weasel.error(username, req.ip, `[Error] The user, '${username}' downloading the analysis excel file failed.`);
        // weasel.error(username, req.ip, "분석 엑셀 파일을 다운로드하는데 실패했습니다.");
        res.status(500).send("Server error");
    }
}));
module.exports = router;
