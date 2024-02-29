import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../service/analysisService";
import { generateDetectFiles, insertDetectFiles } from "../interface/generateRandom";
import Detail from "../analysis/detail";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const keywordService: KeywordService = new KeywordService();
const detail: Detail = new Detail();

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

  analysis.riskScoring(startDate,endDate,keywords)
  .then(result => {
    console.log('result', result);
    
    res.send(result);
  })
  .catch(error => {
    console.log('error',error);
    res.status(error.status).send(error.error);
  });
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
  const pc_guid = req.body.pc_guid;
  const dateRange = analysis.formatPeriod(startDate, endDate);
  const resultValues:any = [];
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
          const patternResult = analysis.analyzeDetailPatterns(result,pc_guid);
          resultValues.push(patternResult);
          resultValues.push(result2);
          resultValues.push(result3);
          resultValues.push({startDate, endDate})
          res.send({result:resultValues})
        })
        .catch((error3) => {
          res.status(400).send("Detail file size fail");
        })
      })
      .catch((error2) => {
        res.status(400).send("Unable to extract numeric value from dateRange Detail");
      })
    });
  } else {
    // 숫자 값을 추출할 수 없는 경우에 대한 처리
    res.status(400).send("Unable to extract numeric value from dateRange Detail");
  }
});


export = router;
