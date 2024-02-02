import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";
import LogService from "../service/logService";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const logService: LogService = new LogService();

router.get("/dashboard", (req: Request, res: Response) => {
  const select = req.query.select;
  const username = req.query.username;

  if (typeof username !== "string" && typeof select !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Failed to load Dashboard Page. [Dashboard]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current Dashboard Page displays data on a ${select}. [Dashboard]`
  );
  res.send("success");
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
      "Failed to load Data-Tables Page. [Data-Tables]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `The current Data-Tables Page displays data on a ${
      contents + " cate : " + category + " sear : " + search
    }. [Data-Tables]`
  );
  res.send("success");
});

router.get("/logout", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Failed to load LogOut. [LogOut]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    req.socket.remoteAddress,
    `Success to LogOut ${username}. [LogOut]`
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
    weasel.log("", req.socket.remoteAddress, `Open Log ${file} [Log File]`);
    res.send([content]);
  })
  .catch((error) => {
    weasel.error("", req.socket.remoteAddress, "Failed Open Log [Log File]");
    res.status(401).send("fail");
  })
})

export = router;
