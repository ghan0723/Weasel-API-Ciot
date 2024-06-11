import * as path from 'path';
import connection from "../db/db";
import MediaService from "../service/mediaService";
import NetworkService from "../service/networkService";
import OutlookService from "../service/outlookService";
import PrintService from "../service/printService";
import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import UserService from "../service/userService";
import { IpRange } from "../interface/interface";
import LeakedService from "../service/leakedService";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const networkService: NetworkService = new NetworkService(connection);
const mediaService: MediaService = new MediaService();
const outlookService: OutlookService = new OutlookService();
const printService: PrintService = new PrintService();
const userService = new UserService();
const ipCalcService:IpCalcService = new IpCalcService();
const leakedService:LeakedService = new LeakedService();

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

  if(username === undefined || username === 'undefined') {
    res.status(200).send("username undefined");
  } else {
    userService.getPrivilegeAndIP(username)
    .then(result => {
      let results;
      ipRanges = IpCalcService.parseIPRange(result[0].ip_ranges);
  
      if (contents === "network") {
        results = networkService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      } else if (contents === "media") {
        results = mediaService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      } else if (contents === "outlook") {
        results = outlookService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      } else if (contents === "print") {
        results = printService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
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
      res.status(500).send("ipRange error");
    });
  }
});

router.get("/refresh", (req: Request, res: Response) => {
  const contents = req.query.contents;
  const id       = req.query.id;
  const name     = req.query.name;

  let results:any;

  if (contents === "network") {
    results = networkService.getUpdateUpLoad(id,name);
  } 
  else if (contents === "media") {
    results = mediaService.getUpdateUpLoad(id);
  } else if (contents === "outlook") {
    results = outlookService.getUpdateUpLoad(id);
  } else if (contents === "print") {
    results = printService.getUpdateUpLoad(id);
  }

  results?.then(() => {
    res.send('success');
  })
  .catch(() => {
    res.status(500).send(contents + " server error");
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
    case 'leaked':
      results =leakedService.getDummyData(count);
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
    weasel.log(username, req.ip, `[Info] The user, '${username}' deleted ${body.length} data in ${contents}.`);
    // weasel.log(username, req.ip, `${contents}의 ${results.length}개 데이터를 삭제하였습니다.`);
  })
  .catch((error) => {
    weasel.error(username, req.ip, `[Error] The user, '${username}' deleted ${body.length} pieces of data in ${contents} fail.`);
    // weasel.error(username, req.ip, `${contents}의 ${results.length}개 데이터를 삭제하는데 실패하였습니다.`);
    console.error(error + " : " + contents);
    res.status(500).send(contents + " server error");
  });

});

// 송신탐지 외 getApiData Logic
function getApiDataLogic(contents:any,page:any,pageSize:any,sorting:any,desc:any,category:any,search:any,username:any,req:Request,res:Response) {
  let ipRanges:IpRange[];

  userService.getPrivilegeAndIP(username)
  .then(result => {
    let results;
    ipRanges = IpCalcService.parseIPRange(result[0].ip_ranges);
    
    switch(contents) {
      case 'network' :
        results = networkService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      break;
      case 'media' :
        results = mediaService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      break;
      case 'outlook' :
        results = outlookService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
      break;
      case 'print' :
        results = printService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,result[0].privilege);
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

// 송신테이블 호출
router.get("/leaked", (req: Request, res: Response) => {
  const page = req.query.page;         // page count
  const pageSize = req.query.pageSize; // page 갯수
  const sorting = req.query.sorting;   // sort column
  const desc = req.query.desc;         // desc : false, asc : true, undefined
  const category = req.query.category; // search column
  const search = req.query.search;     // search context
  const username = req.query.username; // username
  
  let ipRanges:IpRange[];

  if(username === undefined || username === 'undefined') {
    res.status(200).send("username undefined");
  } else {
    userService.getPrivilegeAndIP(username)
    .then(result => {
      ipRanges = IpCalcService.parseIPRange(result[0].ip_ranges);

      leakedService.getApiData(page,pageSize,sorting,desc,category,search,ipRanges,false)
        ?.then((DataItem) => {
          res.send([DataItem, result[0].privilege]);
        })
        .catch((error) => {
          res.status(500).send("server error");
        });
    })
    .catch(error => {
      res.status(500).send("ipRange error");
    });
  }
});

router.post("/decfile", (req: Request, res: Response) => {
  const fileId = req.body.fileId;
  const filePath = req.body.filePath;  

  // /Detects 부분을 실제 파일 시스템 경로로 변환
  const baseDir = 'C:/Program Files (x86)/ciot/WeaselServer/Temp';
  const fullPath:any = [];

  for(let i=0; i < filePath.length; i++) {
    const relativePath = filePath[i].replace('/Detects', '');
    fullPath.push(path.join(baseDir, relativePath));
  }

  networkService.getPcGUID(fileId)
  .then((pc_guid:any) => {
    networkService.fileDecrypt(fullPath,pc_guid[0].pc_guid)
    .then((filename:any) => {
      
      res.status(200).send();
    })
    .catch(() => {
      console.log('fileDecrypt error');
      res.status(500).send({error : 'fileError'});
    });    
  })
  .catch(() => {
    console.log('pcGUID 못 가지고 오는 에러');
    res.status(500).send({error : 'error'});
  });
});

router.post("/deleteDecfile", (req: Request, res: Response) => {
  const downloadPath = req.body.filePath;

  // /Detects 부분을 실제 파일 시스템 경로로 변환
  const baseDir = 'C:/Program Files (x86)/ciot/WeaselServer/Temp';
  const fullPath:any = [];

  for(let i=0; i < downloadPath.length; i++) {
    const relativePath = downloadPath[i].replace('/Detects', '');
    fullPath.push(path.join(baseDir, relativePath));
  }

  networkService.deleteFileDecrypt(fullPath)
  .then(() => {
    res.status(200);
  })
  .catch(() => {
    res.status(500);
  })
  
});

router.post("/leaked", (req:Request, res:Response) => {
  
})
export = router;
