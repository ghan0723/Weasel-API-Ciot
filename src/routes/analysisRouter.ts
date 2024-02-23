import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../service/analysisService";
import { generateDetectFiles, insertDetectFiles } from "../interface/generateRandom";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const keywordService: KeywordService = new KeywordService();

// keywordList
router.get("/keywordList", (req: Request, res: Response) => {
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
router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const dateRange = analysis.formatPeriod(startDate, endDate);
  console.log("dateRange : ", dateRange);
  // 정규식을 사용하여 숫자 값을 추출합니다.
  const matchResult = dateRange.match(/\d+/);
  if (matchResult) {
    const numericValue = parseInt(matchResult[0]);

    analysis.settingDateAndRange(startDate, endDate)
    .then((result) => {
      if(dateRange.includes('week')){
        const averageResult = average.analyzeEventsByWeek(result);
        res.send(averageResult);
      } else if(dateRange.includes('month')){
        const averageResult = average.analyzeEventsByMonth(result, numericValue);
        res.send(averageResult);
      }
    });
  } else {
    // 숫자 값을 추출할 수 없는 경우에 대한 처리
    res.status(400).send("Unable to extract numeric value from dateRange");
  }
});

router.get('/insert', (req:Request, res:Response) => {
  const detectFiles = generateDetectFiles(100);
  insertDetectFiles(detectFiles);
  res.send("샤샷");
})

export = router;
