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
      "172.31.168.112",
      "Failed to load Dashboard Page. [Dashboard]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    "172.31.168.112",
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
      "172.31.168.112",
      "Failed to load Data-Tables Page. [Data-Tables]"
    );
    res.send("error");
  }
  weasel.log(
    username,
    "172.31.168.112",
    `The current Data-Tables Page displays data on a ${
      contents + " cate : " + category + " sear : " + search
    }. [Data-Tables]`
  );
  res.send("success");
});

router.get("/logout", (req: Request, res: Response) => {
  const username = req.query.username;

  if (typeof username !== "string") {
    weasel.error(username, "172.31.168.112", "Failed to load LogOut. [LogOut]");
    res.send("error");
  }
  weasel.log(
    username,
    "172.31.168.112",
    `Success to LogOut ${username}. [LogOut]`
  );
  res.send("success");
});

router.get('/all', async (req, res) => {
  try {
    const logsData = await logService.getLogsData();
    res.send(logsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error});
  }
});

export = router;
