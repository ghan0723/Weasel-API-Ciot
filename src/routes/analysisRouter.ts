import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../service/analysisService";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const keywordService: KeywordService = new KeywordService();

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
router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  analysis.settingDateAndRange(startDate, endDate).then((result) => {
    const averageResult = average.analyzeLeaks(result);
    res.send(averageResult);
  });
});



export = router;
