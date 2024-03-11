import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import LogService from "../service/logService";
import { weasel } from "../interface/log";
import SettingService from "../service/settingService";

const router: Router = express.Router();
const logService: LogService = new LogService();

router.get("/dashboard", (req: Request, res: Response) => {
  const select = req.query.select;
  const username = req.query.username;

  if (typeof username !== "string" && typeof select !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to display the dashboard page"
    );
    res.status(500).send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current dashboard page displays data on a ${select}. `
  );
});

router.get("/tables", (req: Request, res: Response) => {
  const username = req.query.username;
  if (typeof username !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to display the dataTable page"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current data-tables page displays data`
  );
});

router.get("/leaked", (req: Request, res: Response) => {
  const username = req.query.username;
  if (typeof username !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to display the leackedTable page"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current leackedTable page displays data `
  );
  res.send("success");
});

router.get("/analysis", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to display the analysis page."
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current analysis page displays.`
  );
  res.send("success");
});

router.get("/logout", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(username, req.socket.remoteAddress, "Logout failed");
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `Logout for ${username} was successful. `
  );
  res.send("success");
});

router.get("/screenshot", (req:Request, res:Response) => {
  const username = req.query.username;
  const fileName = req.query.fileName;
  if(fileName !== undefined && fileName !== null){
    weasel.log(username, req.socket.remoteAddress, `Download screenshot : ${fileName}`);
  } else {
    weasel.error(username, req.socket.remoteAddress, `Unable to download screenshot : ${fileName}`);
  }
  res.send("make log")
})

router.get("/download", (req:Request, res:Response) => {
  const username = req.query.username;
  const fileName = req.query.fileName;
  if(fileName !== undefined && fileName !== null){
    weasel.log(username, req.socket.remoteAddress, `Download file : ${fileName}`);
  } else {
    weasel.error(username, req.socket.remoteAddress, `Unable to download file : ${fileName}`);
  }
  res.send("make log")
})

// 로그 페이지 관련...
// 감사로그
router.get("/years", (req: Request, res: Response) => {
  logService.getYears().then((years) => {
    res.send(years);
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

  logService
    .getLogContent(year, month, file)
    .then((content) => {
      weasel.log("", req.socket.remoteAddress, `${file} audit log`);
      // weasel.log("", req.socket.remoteAddress, `${file} 감사 로그입니다`);
      res.send([content]);
    })
    .catch(() => {
      weasel.error("", req.socket.remoteAddress,"Failed to view audit log");
      // weasel.error("", req.socket.remoteAddress,"감사 로그 보기 실패");
      res.status(401).send("fail");
    });
});

// 에러 로그
router.get("/error/years", (req: Request, res: Response) => {
  logService.getErrorYears().then((years) => {
    res.send(years);
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

  logService
    .getErrorLogContent(year, month, file)
    .then((content) => {
      weasel.log("", req.socket.remoteAddress, `${file} error log`);
      // weasel.log("", req.socket.remoteAddress, `${file} 에러 로그입니다`);
      res.send([content]);
    })
    .catch(() => {
      weasel.error("", req.socket.remoteAddress,"Failed to view error log");
      // weasel.error("", req.socket.remoteAddress,"에러 로그 보기 실패");
      res.status(401).send("fail");
    });
});

export = router;
