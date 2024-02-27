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
  const startDate = req.body.startDate + " 00:00:00";
  const endDate = req.body.endDate + " 23:59:59";
  const keywords = req.body.keywords;
  const dateRange = analysis.formatPeriod(startDate, endDate);
  // 정규식을 사용하여 숫자 값을 추출합니다.
  const matchResult = dateRange.match(/\d+/);
  if (matchResult) {
    const numericValue = parseInt(matchResult[0]);
    let patternsResult:{ [pcGuid: string]: number } = {};

    analysis.settingDateAndRange(startDate, endDate)
    .then((result) => {
      analysis.getAgentInfo(startDate, endDate)
      .then((result2) => {
          const agnetInfo = analysis.transformAgentInfo(result2);
          // pattern
          if(Object.keys(keywords).length !== 0) {
            patternsResult = analysis.analyzePatterns(result,keywords);
          }

          if(dateRange.includes('week')){
            const averageResult = average.analyzeEventsByWeek(result);
            const averageResult2 = average.analyzeFileSizeByWeek(result); 
            const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
            res.send(scoringPoint);
          } else if(dateRange.includes('month')){
            const averageResult = average.analyzeEventsByMonth(result, numericValue);
            const averageResult2 = average.analyzeFileSizeByMonth(result, numericValue);
            const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
            res.send(scoringPoint);
          } else if(dateRange.includes('year')){
            const averageResult = average.analyzeEventsByYear(result, numericValue);
            const averageResult2 = average.analyzeFileSizeByMonth(result, 12);
            const scoringPoint = analysis.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
            res.send(scoringPoint);
          }
      })
      .catch((error) => {
        res.status(500).send("실패~");
      })
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
});

// detail
router.post("/detail", (req: Request, res: Response) => {
  const startDate = req.body.startDate + " 00:00:00";
  const endDate = req.body.endDate + " 23:59:59";
    
  const dateRange = analysis.formatPeriod(startDate, endDate);
  // 정규식을 사용하여 숫자 값을 추출합니다.
  const matchResult = dateRange.match(/\d+/);
  if (matchResult) {
    const numericValue = parseInt(matchResult[0]);
    // let patternsResult:{ [pcGuid: string]: number } = {};

    analysis.settingDateAndRange(startDate, endDate)
    .then((result:any) => {

    })
  }
});


export = router;
