import BarService from "../service/barService";
import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import IpCalcService from "../service/ipCalcService";

const router: Router = express.Router();
const barService: BarService = new BarService();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();

router.get("/count", (req: Request, res: Response) => {
    let select = req.query.select;
    let username = req.query.username;
    let barData: any[] = [];
  
    // Function to fetch data for each service
    function fetchData(serviceName: string) {
      return userService
        .getGradeAndMngip(username)
        .then((result) => {
          let ipRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
          return barService.getBarData(serviceName, select, ipRange);
        });
    }
  
    // Fetch data for each service concurrently
    Promise.all([
      fetchData("network"),
      fetchData("media"),
      fetchData("outlook"),
      fetchData("print"),
    ])
      .then((dataArray) => {
        barData = dataArray.map((data) => ({
          name: data.table,
          data: data.data.map((item: any) => item.totalCount),
          category: data.data.map((item: any) => item.agentip),
        }));
        res.status(200).send(barData);
      })
      .catch((err) => {
        console.error("에러 발생: ", err);
        // If the error has not been handled earlier, send a generic error message
        res.status(500).send("Error fetching data");
      });
  });
  

export = router;
