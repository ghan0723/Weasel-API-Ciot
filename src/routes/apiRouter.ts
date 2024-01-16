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

// dummy data 생성
router.get('/dummy', (req:Request, res:Response) => {
  const contents = req.query.contents;
  const count = req.query.count;
  // const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  console.log("dummy : ");

  switch(contents) {
    case 'network':
      networkService.getDummyData(count)
      .then(() => {
        getApiDataLogic(contents,0,pageSize,sorting,desc,category,search,req,res);
      })
      .catch((error) => {
        console.error(error + " : " + contents);
        res.status(500).send("server error");
      });
    break;
  }

});

// data 다중 삭제
router.post('/rm', (req:Request, res:Response) => {
  const contents = req.query.contents;
  // const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  const body = req.body;

  switch(contents) {
    case 'network':
      networkService.postRemoveData(body)
      .then(() => {     
        getApiDataLogic(contents,0,pageSize,sorting,desc,category,search,req,res);
      })
      .catch((error) => {
        console.error(error + " : " + contents);
        res.status(500).send("server error");
      });

    break;
  }
});

// 송신탐지 외 getApiData Logic
function getApiDataLogic(contents:any,page:any,pageSize:any,sorting:any,desc:any,category:any,search:any,req:Request,res:Response) {
  switch(contents) {
    case 'network' :
      networkService.getApiData(page,pageSize,sorting,desc,category,search)    
      .then(result => {          
        res.send(result);
      })
      .catch((error) => {
        console.error("getApiDataLogic(network) : " + error);
        res.status(500).send("server error");
      })
    break;
  }
}



export = router;
