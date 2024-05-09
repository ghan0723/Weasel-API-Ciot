import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import LogService from "../service/logService";
import { weasel } from "../interface/log";
import SettingService from "../service/settingService";
import { backIP } from "../interface/ipDomain";

const router: Router = express.Router();
const logService: LogService = new LogService();
const userService: UserService = new UserService();

router.get("/dashboard", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' failed to navigate to the Dashboard menu.`);
    // weasel.error(username, req.socket.remoteAddress, "Dashboard 메뉴로 이동에 실패하였습니다.");
    res.status(500).send("dashboard log error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `[Info] The user, '${username}' accessed the Dashboard menu.`
  );
  // weasel.log(username,req.socket.remoteAddress,`Dashboard 메뉴로 이동하였습니다.`);
  res.send("dashboard log success");
});

router.get("/tables", (req: Request, res: Response) => {
  const username = req.query.username;
  if (typeof username !== "string") {
    weasel.error(username, req.socket.remoteAddress,`[Error] The user, '${username}' failed to navigate to the Leak Detection History menu.`);
    // weasel.error(username, req.socket.remoteAddress,"유출탐지내역 메뉴로 이동에 실패하였습니다.");
    res.status(500).send("tables log error");
  }
  weasel.log(username,req.socket.remoteAddress,`[Info] The user, '${username}' accessed the Leak Detection History menu.`);
  // weasel.log(username,req.socket.remoteAddress,`유출탐지내역 메뉴로 이동하였습니다.`);
  res.send("tables log success");
});

router.get("/leaked", (req: Request, res: Response) => {
  const username = req.query.username;
  userService.getPrivilege(username)
  .then((result) => {
    if(result[0].privilege === 3){
      weasel.log(username,req.socket.remoteAddress,`[Warn] The user, '${username}' is not allowed to use the Watchlist.`);
      // weasel.log(username,req.socket.remoteAddress,`관리대상목록을 이용할 수 없는 계정입니다.`);
      res.status(400).send(result[0].privilege);
    } else {
      weasel.log(username,req.socket.remoteAddress,`[Info] The user, '${username}' accessed the Watchlist menu.`);
      // weasel.log(username,req.socket.remoteAddress,`관리대상 목록 메뉴로 이동하였습니다.`);
      res.send("leaked log success");
    }
  })
  .catch((error) => {
    weasel.error(username, req.socket.remoteAddress,  `[Error] The user, '${username}' failed to navigate to the Watchlist menu.`);
    // weasel.error(username, req.socket.remoteAddress,  "관리대상목록 메뉴로 이동에 실패하였습니다.");
    res.status(500).send("leaked log error");
  })
});

router.get("/analysis", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' failed to navigate to the Analytics menu.`);
    // weasel.error(username, req.socket.remoteAddress, "분석 메뉴로 이동에 실패하였습니다.");
    res.status(500).send("analysis log error");
  }
  weasel.log(username,req.socket.remoteAddress,`[Info] The user, '${username}' accessed the Analytics menu.`);
  // weasel.log(username,req.socket.remoteAddress,`분석 메뉴로 이동하였습니다.`);
  res.send("analysis log success");
});

router.get("/logout", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' encountered an unexpected error on the server while trying to log out, causing the server to crash.`);
    // weasel.error(username, req.socket.remoteAddress, "로그아웃 시도 중에 서버에서 예기치 않은 오류가 발생하여 서버가 중단되었습니다.");
    res.status(500).send("logout log error");
  }
  weasel.log(username,req.socket.remoteAddress,`[Info] The user, '${username}' successfully logged out.`);
  // weasel.log(username,req.socket.remoteAddress,`${username}의 로그아웃에 성공하였습니다.`);
  const pastDate = new Date(0);
  res.send({error : "logout log success"});
});

// 로그 페이지 관련...
// 감사로그
router.get("/years", (req: Request, res: Response) => {
  const username = req.query.username;

  if(username === null || username === undefined || username === 'null' || username === 'undefined') {
    return res.send({privilege : undefined})
  }
  
  userService.getPrivilege(username)
  .then((privilege:any) => {    
    if(privilege[0].privilege === undefined || privilege[0].privilege !== 1) {
      res.send({privilege : privilege[0].privilege});
    } else {      
      logService.getYears().then((years:any) => {        
        res.send({
          privilege : privilege[0].privilege,
          years : years
        });
      });
    }
  });
});

router.get("/months", (req: Request, res: Response) => {
  let year = req.query.year;
  logService.getMonths(year).then((months) => {
    res.send(months);
  });
});

router.get("/day", (req: Request, res: Response) => {
  let year = req.query.year;
  let month = req.query.month;
  logService.getLogFiles(year, month).then((files) => {
    res.send(files);
  });
});

router.get("/file", (req: Request, res: Response) => {
  let year = req.query.year;
  let month = req.query.month;
  let file = req.query.file;
  const username = req.query.username;

  logService
    .getLogContent(year, month, file)
    .then((content) => {
      weasel.log(username, req.socket.remoteAddress, `[Info] The user, '${username}' checked the ${file} audit log.`);
      // weasel.log("", req.socket.remoteAddress, `${file} 감사 로그를 확인하였습니다.`);
      res.send([content]);
    })
    .catch(() => {
      weasel.error(username, req.socket.remoteAddress,`[Error] The user, '${username}' failed to check the audit log.`);
      // weasel.error("", req.socket.remoteAddress,"${fileName}의 감사 로그 확인에 실패하였습니다.");
      res.status(401).send("audit log error");
    });
});

// 에러 로그
router.get("/error/years", (req: Request, res: Response) => {
  const username = req.query.username;
  
  if(username === null || username === undefined || username === 'null' || username === 'undefined') {
    return res.send({privilege : undefined})
  }
  
  userService.getPrivilege(username)
  .then((privilege:any) => {    
    if(privilege[0].privilege === undefined || privilege[0].privilege !== 1) {
      res.send({privilege : privilege[0].privilege});
    } else {      
      logService.getErrorYears().then((years:any) => {        
        res.send({
          privilege : privilege[0].privilege,
          years : years
        });
      });
    }
  });
});

router.get("/error/months", (req: Request, res: Response) => {
  let year = req.query.year;
  logService.getErrorMonths(year).then((months) => {
    res.send(months);
  });
});

router.get("/error/day", (req: Request, res: Response) => {
  let year = req.query.year;
  let month = req.query.month;
  logService.getErrorLogFiles(year, month).then((files) => {
    res.send(files);
  });
});

router.get("/error/file", (req: Request, res: Response) => {
  let year = req.query.year;
  let month = req.query.month;
  let file = req.query.file;
  const username = req.query.username;

  logService
    .getErrorLogContent(year, month, file)
    .then((content) => {
      weasel.log(username, req.socket.remoteAddress, `[Info] The user, '${username}' checked the ${file} error log.`);
      // weasel.log("", req.socket.remoteAddress, `${file} 에러 로그를 확인하였습니다.`);
      res.send([content]);
    })
    .catch(() => {
      weasel.error(username, req.socket.remoteAddress,`[Error] The user, '${username}' checking the error log for ${ file } failed.`);
      // weasel.error("", req.socket.remoteAddress,"${ fileName }의 에러 로그 확인에 실패하였습니다.");
      res.status(401).send("error log error");
    });
});

router.get("/screenshot", (req:Request, res:Response) => {
  const username = req.query.username;
  const fileName = req.query.fileName;
  if(fileName !== undefined && fileName !== null){
    weasel.log(username, req.socket.remoteAddress, `[Info] The user, '${username}' downloaded a screenshot of ${fileName}.`);
    // weasel.log(username, req.socket.remoteAddress, `${fileName}의 스크린샷을 다운로드 하였습니다.`);
  } else {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' downloading a screenshot of ${fileName} failed.`);
    // weasel.error(username, req.socket.remoteAddress, `${fileName}의 스크린샷을 다운로드하는데 실패하였습니다.`);
    res.status(500).send("screenshot log error");
  }
  res.send("screenshot log success");
})

router.get("/download", (req:Request, res:Response) => {
  const username = req.query.username;
  const fileName = req.query.fileName;
  if(fileName !== undefined && fileName !== null){
    weasel.log(username, req.socket.remoteAddress, `[Info] The user, '${username}' downloaded the file ${fileName}.`);
    // weasel.log(username, req.socket.remoteAddress, `${fileName}의 파일을 다운로드 하였습니다.`);
  } else {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' failed to download the file ${fileName}.`);
    // weasel.error(username, req.socket.remoteAddress, `${fileName}의 파일을 다운로드하는데 실패하였습니다.`);
    res.status(500).send("download log error");
  }
  res.send("download log success");
})

router.get("/userList", (req:Request, res:Response) => {
  const username = req.query.username;
  if (typeof username !== "string" ) {
    weasel.error(username, req.socket.remoteAddress, `[Error] The user, '${username}' failed to navigate to The user, Management menu.`);
    // weasel.error(username, req.socket.remoteAddress, "사용자 관리 메뉴로 이동에 실패하였습니다.");
    res.status(500).send("userList log error");
  } else {
    weasel.log(username, req.socket.remoteAddress, `[Info] The user, '${username}' accessed The user, Management menu.`);
    // weasel.log(username, req.socket.remoteAddress, `사용자 관리 메뉴로 이동하였습니다.`);
  }
  res.send("userList log success");
})

export = router;
