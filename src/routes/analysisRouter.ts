import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../service/analysisService";
import { generateDetectFiles, insertDetectFiles } from "../interface/generateRandom";
import Detail from "../analysis/detail";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const keywordService: KeywordService = new KeywordService();
const detail: Detail = new Detail();
const userService: UserService = new UserService();

// keywordList
router.get("/keywordList", (req: Request, res: Response) => {
  keywordService
    .getKeywordList()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// analysis
router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate + " 00:00:00";
  const endDate = req.body.endDate + " 23:59:59";
  const keywords = req.body.keywords;
  const username = req.body.username;
  userService.getPrivilegeAndIP(username)
  .then((result1) => {
    const ipRanges = IpCalcService.parseIPRange(result1[0].ip_ranges);
    if(result1[0].privilege !== 1){
      analysis.riskScoring(startDate,endDate,keywords,ipRanges)
      .then(result => {    
        if(result.length > 0 && result !== undefined && result !== null){
          res.send(result);
        } else {
          res.send([{pcGuid: '',
          level: 0,
          pcName: '',
          status: '',
          text: ''}])
        }
      })
      .catch(error => {
        res.status(error.status).send(error.error);
      });
    } else {
      //관리자일때
      analysis.riskScoring(startDate,endDate,keywords, ipRanges)
      .then(result => {    
        if(result.length > 0 && result !== undefined && result !== null){
          res.send(result);
        } else {
          res.send([{pcGuid: '',
          level: 0,
          pcName: '',
          status: '',
          text: ''}])
        }
      })
      .catch(error => {
        res.status(error.status).send(error.error);
      });
    }
  })
  .catch((error1) => {
    res.status(error1.status).send(error1.error);
  })
});

router.get('/insert', (req:Request, res:Response) => {
  const detectFiles = generateDetectFiles(3500);
  insertDetectFiles(detectFiles);
  res.send("샤샷");
});

// detail
router.post("/detail", (req: Request, res: Response) => {
  const startDate = req.body.startDate + " 00:00:00";
  const endDate = req.body.endDate + " 23:59:59";
  const pc_guid = req.body.pc_guid;
  const level = req.body.level;
  const status = req.body.status;
  const username = req.body.username;
  const dateRange = analysis.formatPeriod(startDate, endDate);
  const resultValues:any = [];
  // 정규식을 사용하여 숫자 값을 추출합니다.
  const matchResult = dateRange.match(/\d+/);
  userService.getPrivilegeAndIP(username)
  .then((result1) => {
    const ipRanges = IpCalcService.parseIPRange(result1[0].ip_ranges);
    if(result1[0].privilege !== 1){
      if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        analysis.settingDateAndRange(startDate, endDate, ipRanges, pc_guid)
        .then((result) => {
          detail.getAnalysisLineDateByPcGuid(pc_guid, dateRange, startDate, endDate, numericValue)
          .then((result2) => {
            detail.getCountFileSize(pc_guid, dateRange, startDate, endDate, numericValue)
            .then((result3) => {
              const patternResult = analysis.analyzeDetailPatterns(result,pc_guid);
              resultValues.push(patternResult);
              resultValues.push(result2);
              resultValues.push(result3);
              resultValues.push({startDate, endDate, level, status})
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
    } else {
      if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        analysis.settingDateAndRange(startDate, endDate, undefined, pc_guid)
        .then((result) => {
          detail.getAnalysisLineDateByPcGuid(pc_guid, dateRange, startDate, endDate, numericValue)
          .then((result2) => {
            detail.getCountFileSize(pc_guid, dateRange, startDate, endDate, numericValue)
            .then((result3) => {
              const patternResult = analysis.analyzeDetailPatterns(result,pc_guid);
              resultValues.push(patternResult);
              resultValues.push(result2);
              resultValues.push(result3);
              resultValues.push({startDate, endDate, level, status})
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
    }
  })
});


export = router;
