import connection from "../db/db";
import MediaService from "../service/mediaService";
import NetworkService from "../service/networkService";
import OutlookService from "../service/outlookService";
import PrintService from "../service/printService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const mediaService: MediaService = new MediaService();
const outlookService: OutlookService = new OutlookService();
const printService: PrintService = new PrintService();

router.get("/", (req: Request, res: Response) => {
  const contents = req.query.contents;
  const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  console.log("contents : " , contents);
  console.log("page : " , page);
  console.log("pageSize : " , pageSize);
  console.log("sorting : ", sorting);
  console.log("desc : ", desc);
  console.log("category : " , category);
  console.log("search : " , search);
  console.log("page type : ", typeof(page));
  console.log("page type : ", typeof(pageSize));  
  
  let results;

  if (contents === "network") {
    results = networkService.getApiData(page,pageSize,sorting,desc,category,search);
  } else if (contents === "media") {
    results = mediaService.getApiData(page,pageSize);
  } else if (contents === "outlook") {
    results = outlookService.getApiData();
  } else if (contents === "print") {
    results = printService.getApiData();
  } else {
    // Handle the case when param doesn't match any of the expected values
    console.error("Invalid param:", contents);
  }

  results
    ?.then((DataItem) => {
      res.send(DataItem);
    })
    .catch((error) => {
      console.error(error + " : " + contents);
      res.status(500).send("server error");
    });
});

export = router;
