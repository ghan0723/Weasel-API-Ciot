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

const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const mediaService: MediaService = new MediaService();
const outlookService: OutlookService = new OutlookService();
const printService: PrintService = new PrintService();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const excelService: ExcelService = new ExcelService();

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
  
      const result = await userService.getGradeAndMngip(username);
      const ipRanges: IpRange[] = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
  
      let results;
      if (contents === "network") {
        results = await networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges);
      } else if (contents === "media") {
        results = await mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges);
      } else if (contents === "outlook") {
        results = await outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges);
      } else if (contents === "print") {
        results = await printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges);
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
export = router;
