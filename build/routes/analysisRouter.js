"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const average_1 = __importDefault(require("../analysis/average"));
const express_1 = __importDefault(require("express"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const analysisService_1 = __importDefault(require("../service/analysisService"));
const router = express_1.default.Router();
const average = new average_1.default();
const analysis = new analysisService_1.default();
const keywordService = new keywordService_1.default();
// keywordList => 현재 사용 x, 추후 삭제 예정
// router.get("/keywordList", (req: Request, res: Response) => {
//   keywordService
//     .getKeywordList()
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });
// analysis
router.post("/select", (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    analysis.settingDateAndRange(startDate, endDate).then((result) => {
        const averageResult = average.analyzeLeaks(result);
        res.send(averageResult);
    });
});
module.exports = router;
