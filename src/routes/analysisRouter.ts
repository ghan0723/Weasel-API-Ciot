import ComplexService from "../service/complexService";
import Average from "../analysis/average";
import express, { Request, Response, Router } from "express";
import KeywordService from "../service/keywordService";
import Analysis from "../analysis/analysis";
import IpCalcService from "../service/ipCalcService";

const router: Router = express.Router();
const average: Average = new Average();
const analysis: Analysis = new Analysis();
const complexService: ComplexService = new ComplexService();
const keywordService: KeywordService = new KeywordService();
const ipCalcService = new IpCalcService();

router.get("/average", (req: Request, res: Response) => {
  complexService
    .getAllData()
    .then((result) => {
      average.analyzeLeaks(result);
      res.send("바위");
    })
    .catch((error) => {
      console.log("실패...");
    });
});

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

router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const ipRange = req.body.ipRange;

  let ipRanges = ipCalcService.parseIPRange(ipRange);
  analysis.settingDateAndRange(startDate, endDate, ipRanges).then((result) => {
    average.analyzeLeaks(result);
    res.send(result);
  });
});

export = router;
