import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import UserService from "../service/userService";
import ComplexService from "../service/complexService";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const complexService: ComplexService = new ComplexService();

router.get("/all", (req: Request, res: Response) => {
  let select = req.query.select;
  let username = req.query.username;
  // Function to fetch data for each service
  function fetchData(serviceName: string) {
    return userService.getPrivilegeAndIP(username).then((result) => {
      let ipRange = IpCalcService.parseIPRange(result[0].ip_ranges);
      return complexService.getData(serviceName, select, ipRange);
    });
  }

  Promise.all([
    fetchData("network"),
    fetchData("media"),
    fetchData("outlook"),
    fetchData("print"),
  ])
    .then((dataArray) => {
      res.status(200).send(dataArray);
    })
    .catch((err) => {
      console.error("에러 발생: ", err);
      // If the error has not been handled earlier, send a generic error message
      res.status(500).send("Error fetching data");
    });
});

export = router;
