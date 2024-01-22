import connection from "../db/db";
import MediaService from "../service/mediaService";
import NetworkService from "../service/networkService";
import OutlookService from "../service/outlookService";
import PrintService from "../service/printService";
import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import UserService from "../service/userService";
import { IpRange } from "../interface/interface";

const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const mediaService: MediaService = new MediaService();
const outlookService: OutlookService = new OutlookService();
const printService: PrintService = new PrintService();
const userService = new UserService();
const ipCalcService:IpCalcService = new IpCalcService();

// 송신테이블 호출
router.get("/", (req: Request, res: Response) => {
  const contents = req.query.contents;
  const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  const username = req.query.username; // username
  
  
  let ipRanges:IpRange[];

  userService.getGradeAndMngip(username)
  .then(result => {
    let results;
    ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);

    if (contents === "network") {
      results = networkService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
    } else if (contents === "media") {
      results = mediaService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
    } else if (contents === "outlook") {
      results = outlookService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
    } else if (contents === "print") {
      results = printService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
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
  })
  .catch(error => {
    console.error("ipRange error : ", error);
  });
});

// dummy data 생성
router.get('/dummy', (req:Request, res:Response) => {
  let   results;
  const contents = req.query.contents;
  const count = req.query.count;
  // const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  const username = req.query.username; // username
  console.log("dummy : ", contents);

  switch(contents) {
    case 'network':
      results = networkService.getDummyData(count);
    break;
    case 'media':
      results = mediaService.getDummyData(count);
    break;
    case 'outlook':
      results =outlookService.getDummyData(count);
    break;
    case 'print':
      results =printService.getDummyData(count);
    break;
  }

  results?.then(() => {
    getApiDataLogic(contents,0,pageSize,sorting,desc,category,search,username,req,res);
  })
  .catch((error) => {
    console.error(error + " : " + contents);
    res.status(500).send(contents + " server error");
  });

});

// data 다중 삭제
router.post('/rm', (req:Request, res:Response) => {
  let results;
  const contents = req.query.contents;
  // const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  const username = req.query.username; // username
  const body = req.body;

  switch(contents) {
    case 'network':
      results = networkService.postRemoveData(body);
    break;
    case 'media':
      results = mediaService.postRemoveData(body);
    break;
    case 'outlook':
      results = outlookService.postRemoveData(body);
    break;
    case 'print':
      results = printService.postRemoveData(body);
    break;
  }

  results?.then(() => {     
    getApiDataLogic(contents,0,pageSize,sorting,desc,category,search,username,req,res);
  })
  .catch((error) => {
    console.error(error + " : " + contents);
    res.status(500).send(contents + " server error");
  });

});

// 송신탐지 외 getApiData Logic
function getApiDataLogic(contents:any,page:any,pageSize:any,sorting:any,desc:any,category:any,search:any,username:any,req:Request,res:Response) {
  let ipRanges:IpRange[];  

  userService.getGradeAndMngip(username)
  .then(result => {
    let results;
    ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
    console.log('ipRange : ', ipRanges);
    
    switch(contents) {
      case 'network' :
        results = networkService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
      break;
      case 'media' :
        results = mediaService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
      break;
      case 'outlook' :
        results = outlookService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
      break;
      case 'print' :
        results = printService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges);
      break;
    }

    results
      ?.then((DataItem) => {
        res.send(DataItem);
      })
      .catch((error) => {
        console.error(`getApiDataLogic(${contents}) error`);
        res.status(500).send("server error");
      });
  });
}


export = router;