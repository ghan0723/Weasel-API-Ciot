import { IpRange } from "./../interface/interface";
import UserService from "../service/userService";
import connection from "../db/db";
import MediaService from "../service/mediaService";
import NetworkService from "../service/networkService";
import OutlookService from "../service/outlookService";
import PrintService from "../service/printService";
import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import ExcelService from "../service/excelService";
import LeakedService from "../service/leakedService";
import AnalysisService from "../service/analysisService";

const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const mediaService: MediaService = new MediaService();
const outlookService: OutlookService = new OutlookService();
const printService: PrintService = new PrintService();
const leakedService:LeakedService = new LeakedService();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const excelService: ExcelService = new ExcelService();
const analysis:AnalysisService = new AnalysisService();

router.get("/dwn", async (req: Request, res: Response) => {
    try {
      const contents = req.query.contents;
      const page = req.query.page;
      const pageSize = req.query.pageSize;
      const sorting = req.query.sorting;
      const desc = req.query.desc;
      const category = req.query.category;
      const search = req.query.search;
      const username = req.query.username;
  
      const result = await userService.getPrivilegeAndIP(username);
      const ipRanges: IpRange[] = ipCalcService.parseIPRange(result[0].ip_ranges);
  
      let results;
      if (contents === "network") {
        results = await networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges,result[0].privilege, true);
      } else if (contents === "media") {
        results = await mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges,result[0].privilege, true);
      } else if (contents === "outlook") {
        results = await outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges,result[0].privilege, true);
      } else if (contents === "print") {
        results = await printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges,result[0].privilege, true);
      } else if (contents === "leaked") {
        results = await leakedService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,true);
      } else {
        console.error("Invalid param:", contents);
        res.status(400).send("Invalid param");
        return;
      }
  
      if (!results) {
        console.error("No data found");
        res.status(404).send("No data found");
        return;
      }
      const excelBuffer = await excelService.getExcelFile(results[0], `${contents}`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${contents}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Server error");
    }
  });

  router.post("/analytics", async (req: Request, res: Response) => {
    try {
      const startDate = req.body.startDate + " 00:00:00";
      const endDate = req.body.endDate + " 23:59:59";
      const keywords = req.body.keywords;
      const results = await analysis.riskScoring(startDate,endDate,keywords);

      for(let i=0; i < results.length; i++) {
        results[i]['PC명(IP주소)'] = results[i]['pcName'];
        if(results[i]['level'] === 1) {
          results[i]['등급'] = '관심';
        } else if(results[i]['level'] === 2) {
          results[i]['등급'] = '주의';
        } else if(results[i]['level'] === 3) {
          results[i]['등급'] = '경고';
        } else if(results[i]['level'] === 4) {
          results[i]['등급'] = '위험';
        } else {
          results[i]['등급'] = '매우 위험';
        }

        results[i]['위험도 수치'] = results[i]['status'];
        results[i]['설명'] = results[i]['text'];
        delete results[i].pcGuid;
        delete results[i].progress;
        delete results[i].pcName;
        delete results[i].level;
        delete results[i].status;
        delete results[i].text;
      }
  
      if (!results) {
        console.error("No data found");
        res.status(404).send("No data found");
        return;
      }
      
      const excelBuffer = await excelService.getExcelFile(results, 'analytics');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=analytics.xlsx`);
      res.send(excelBuffer);

    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Server error");
    }
  });
  
export = router;
