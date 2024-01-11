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
  const page = req.query.page;
  const pageSize = req.query.pageSize;
  const category = req.query.category;
  const search = req.query.search;
  console.log("contents : " , contents);
  console.log("page : " , page);
  console.log("pageSize : " , pageSize);
  console.log("category : " , category);
  console.log("search : " , search);
  
  let results;

  if (contents === "network") {
    results = networkService.getApiData();
  } else if (contents === "media") {
    results = mediaService.getApiData();
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
