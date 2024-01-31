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
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const mediaService = new mediaService_1.default();
const outlookService = new outlookService_1.default();
const printService = new printService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const excelService = new excelService_1.default();
router.get("/dwn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contents = req.query.contents;
        const page = req.query.page;
        const pageSize = req.query.pageSize;
        const sorting = req.query.sorting;
        const desc = req.query.desc;
        const category = req.query.category;
        const search = req.query.search;
        const username = req.query.username;
        const result = yield userService.getGradeAndMngip(username);
        const ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
        let results;
        if (contents === "network") {
            results = yield networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].grade);
        }
        else if (contents === "media") {
            results = yield mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].grade);
        }
        else if (contents === "outlook") {
            results = yield outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].grade);
        }
        else if (contents === "print") {
            results = yield printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].grade);
        }
        else {
            console.error("Invalid param:", contents);
            res.status(400).send("Invalid param");
            return;
        }
        if (!results) {
            console.error("No data found");
            res.status(404).send("No data found");
            return;
        }
        const excelBuffer = yield excelService.getExcelFile(results[0], `${contents}`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${contents}.xlsx`);
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).send("Server error");
    }
}));
module.exports = router;
