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
const express_1 = __importDefault(require("express"));
const excelService_1 = __importDefault(require("../service/excelService"));
const sessionService_1 = __importDefault(require("../service/sessionService"));
const router = express_1.default.Router();
const userService = new userService_1.default();
const excelService = new excelService_1.default();
const sessionService = new sessionService_1.default();
// router.get("/dwn", async (req: Request, res: Response) => {
//   const username = req.query.username;
//   const contents = req.query.contents;
//   try {
//     const page = req.query.page;
//     const pageSize = req.query.pageSize;
//     const sorting = req.query.sorting;
//     const desc = req.query.desc;
//     const category = req.query.category;
//     const search = req.query.search;
//     const result = await userService.getPrivilegeAndIP(username);
//     const ipRanges: IpRange[] = IpCalcService.parseIPRange(result[0].ip_ranges);
//     let results;
//     if (contents === "network") {
//       results = await networkService.getApiData(
//         page,
//         pageSize,
//         sorting,
//         desc,
//         category,
//         search,
//         ipRanges,
//         result[0].privilege,
//         true
//       );
//     } else if (contents === "media") {
//       results = await mediaService.getApiData(
//         page,
//         pageSize,
//         sorting,
//         desc,
//         category,
//         search,
//         ipRanges,
//         result[0].privilege,
//         true
//       );
//     } else if (contents === "outlook") {
//       results = await outlookService.getApiData(
//         page,
//         pageSize,
//         sorting,
//         desc,
//         category,
//         search,
//         ipRanges,
//         result[0].privilege,
//         true
//       );
//     } else if (contents === "print") {
//       results = await printService.getApiData(
//         page,
//         pageSize,
//         sorting,
//         desc,
//         category,
//         search,
//         ipRanges,
//         result[0].privilege,
//         true
//       );
//     } else if (contents === "leaked") {
//       results = await leakedService.getApiData(
//         page,
//         pageSize,
//         sorting,
//         desc,
//         category,
//         search,
//         ipRanges,
//         true
//       );
//     } else {
//       console.error("Invalid param:", contents);
//       res.status(400).send("Invalid param");
//       return;
//     }
//     if (!results) {
//       console.error("No data found");
//       res.status(404).send("No data found");
//       return;
//     }
//     const excelBuffer = await excelService.getExcelFile(
//       results[0],
//       `${contents}`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${contents}.xlsx`
//     );
//     res.send(excelBuffer);
//     weasel.log(username,req.socket.remoteAddress,`You have downloaded the Excel file of ${contents}.`);
//     // weasel.log(username,req.socket.remoteAddress,`${contents}의 액셀 파일을 다운로드 하였습니다.`);
//   } catch (error) {
//     weasel.error(username, req.socket.remoteAddress, `The download of the excel file in ${contents} failed.`);
//     // weasel.error(username, req.socket.remoteAddress, `${contents}의 엑셀 파일을 다운로드하는데 실패하였습니다.`);
//     res.status(500).send("Server error");
//   }
// });
// router.post("/analytics", async (req: Request, res: Response) => {
//   const username = req.query.username
//   try {
//     const startDate = req.body.startDate + " 00:00:00";
//     const endDate = req.body.endDate + " 23:59:59";
//     const keywords = req.body.keywords;
//     userService.getPrivilegeAndIP(username)
//     .then(async (result1) => {
//       const ipRanges = IpCalcService.parseIPRange(result1[0].ip_ranges);
//       const results = await analysis.riskScoring(startDate, endDate, keywords, ipRanges);
//       for (let i = 0; i < results.length; i++) {
//         results[i]["PC명(IP주소)"] = results[i]["pcName"];
//         if (results[i]["level"] === 1) {
//           results[i]["등급"] = "관심";
//         } else if (results[i]["level"] === 2) {
//           results[i]["등급"] = "주의";
//         } else if (results[i]["level"] === 3) {
//           results[i]["등급"] = "경고";
//         } else if (results[i]["level"] === 4) {
//           results[i]["등급"] = "위험";
//         } else {
//           results[i]["등급"] = "매우 위험";
//         }
//         results[i]["위험도 수치"] = results[i]["status"];
//         results[i]["설명"] = results[i]["text"];
//         delete results[i].pcGuid;
//         delete results[i].progress;
//         delete results[i].pcName;
//         delete results[i].level;
//         delete results[i].status;
//         delete results[i].text;
//       }
//       if (!results) {
//         console.error("No data found");
//         res.status(404).send("No data found");
//         return;
//       }
//       const excelBuffer = await excelService.getExcelFile(results, "analytics");
//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );
//       res.setHeader("Content-Disposition", `attachment; filename=analytics.xlsx`);
//       res.send(excelBuffer);
//       weasel.log(username,req.socket.remoteAddress,"Downloaded the excel file of the analysis.");
//       // weasel.log(username,req.socket.remoteAddress,"분석의 엑셀 파일을 다운로드 하였습니다.");
//     })
//   } catch (error) {
//     weasel.error(username, req.socket.remoteAddress, "Downloading the analysis excel file failed.");
//     // weasel.error(username, req.socket.remoteAddress, "분석 엑셀 파일을 다운로드하는데 실패했습니다.");
//     res.status(500).send("Server error");
//   }
// });
router.get('/session', (req, res) => {
    let category = req.query.category;
    let searchWord = req.query.searchWord;
    let rows = req.query.rows;
    sessionService.getSessionListByExcel(category, searchWord, rows)
        .then((sessionList) => __awaiter(void 0, void 0, void 0, function* () {
        const excelBuffer = yield excelService.getExcelFile(sessionList, "session");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=session.xlsx`);
        res.send(excelBuffer);
    }))
        .catch((sessionListError) => {
    });
});
module.exports = router;
