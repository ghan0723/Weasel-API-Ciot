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

router.get("/:url", (req: Request, res: Response) => {
  let param = req.params.url;
  console.log("url : " , param);
  
  let results;

  if (param === ":network") {
    results = networkService.getApiData();
  } else if (param === ":media") {
    results = mediaService.getApiData();
  } else if (param === ":outlook") {
    results = outlookService.getApiData();
  } else if (param === ":print") {
    results = printService.getApiData();
  } else {
    // Handle the case when param doesn't match any of the expected values
    console.error("Invalid param:", param);
  }

  results
    ?.then((DataItem) => {
      res.send(DataItem);
    })
    .catch((error) => {
      console.error(error + " : " + param);
      res.status(500).send("server error");
    });
});

export = router;
