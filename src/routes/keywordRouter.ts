import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import UserService from "../service/userService";
import KeywordService from "../service/keywordService";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const keywordService: KeywordService = new KeywordService();

router.get("/all", (req: Request, res: Response) => {
  let select = req.query.select;
  let username = req.query.username;

  function fetchData(serviceName: string) {
    return userService.getGradeAndMngip(username).then((result) => {
      let ipRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
      return keywordService.getKeyword(serviceName, select, ipRange);
    });
  }

  Promise.all([
    fetchData("network"),
    fetchData("media"),
    fetchData("outlook"),
  ])
  .then((dataArray) => {
    res.status(200).send("수고");
  })
  .catch((err) => {
    console.error("에러 발생: ", err);
    res.status(500).send("Error fetching data");
  });
});

export = router;
