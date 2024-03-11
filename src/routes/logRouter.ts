import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import LogService from "../service/logService";
import { weasel } from "../interface/log";
import SettingService from "../service/settingService";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const logService: LogService = new LogService();
const settingService: SettingService = new SettingService();

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

  settingService.getOutlookFlag()
  .then((result) => {
    if((result[0].flag & 256) === 256){
      res.send(true);
    } else {
      res.send(false);
    }
  })
  .catch((error) => {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to retrieve outlook flag value"
    );
    res.status(500).send("error");
  })
});

router.get("/tables", (req: Request, res: Response) => {
  const username = req.query.username;
  const contents = req.query.contents;
  const category = req.query.category;
  const search = req.query.search;

  if (typeof username !== "string" && typeof contents !== "string") {
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
    `The current data-tables page displays data on a ${
      contents + " category : " + category + " searchWord : " + search
    }. `
  );

  settingService.getOutlookFlag()
  .then((result) => {
    if((result[0].flag & 256) === 256){
      res.send(true);
    } else {
      res.send(false);
    }
  })
  .catch(() => {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to retrieve outlook flag value"
    );
    res.status(500).send("error");
  })
});

router.get("/leaked", (req: Request, res: Response) => {
  const username = req.query.username;
  const category = req.query.category;
  const search = req.query.search;

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
    `The current leackedTable page displays data on a ${
      "leaked category : " + category + " searchWord : " + search
    }. `
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
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Logout failed"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `Logout for ${username} was successful. `
  );
  res.send("success");
});

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
  logService.getLogFiles(year, month)
  .then((files) => {
    res.send(files);
  })
})

router.get("/file", (req:Request, res:Response) => {
  let year = req.query.year;
  let month = req.query.month;
  let file = req.query.file;

  logService.getLogContent(year, month, file)
  .then((content) => {
    weasel.log("", req.socket.remoteAddress, `Verified ${file} audit log`);
    res.send([content]);
  })
  .catch((error) => {
    weasel.error("", req.socket.remoteAddress, "Failed to retrieve the audit log");
    res.status(401).send("fail");
  })
})

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
  logService.getErrorLogFiles(year, month)
  .then((files) => {
    res.send(files);
  })
})

router.get("/error/file", (req:Request, res:Response) => {
  let year = req.query.year;
  let month = req.query.month;
  let file = req.query.file;

  logService.getErrorLogContent(year, month, file)
  .then((content) => {
    weasel.log("", req.socket.remoteAddress, `Verified ${file} error log`);
    res.send([content]);
  })
  .catch((error) => {
    weasel.error("", req.socket.remoteAddress, "Failed to retrieve the error log");
    res.status(401).send("fail");
  })
})

export = router;
