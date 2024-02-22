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

router.post("/select", (req: Request, res: Response) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  analysis.settingDateAndRange(startDate, endDate).then((result) => {
    const averageResult = average.analyzeFileSize(result);
    res.send(averageResult);
  });
});

router.get('/insert', (req:Request, res:Response) => {
  const detectFiles = generateDetectFiles(100);
  insertDetectFiles(detectFiles);
  res.send("샤샷");
})

export = router;
