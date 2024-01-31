import { weasel } from "../interface/log";
import SettingService from "../service/settingService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const settingService: SettingService = new SettingService();

router.post("/server", (req: Request, res: Response) => {
  const username = req.query.username;
  const server = req.body;
  settingService
    .modServerSetting(server)
    .then((result) => {
      weasel.log(username, "172.31.168.112", "Success to Update Server Setting [Server]");
      res.send("업데이트 성공했습니다.");
    })
    .catch((error) => {
      weasel.error(username, "172.31.168.112", "Failed to Update Server Setting [Server]");
      console.error("update 에러 : ", error);
      res.status(500).send("update 하다가 에러났어요");
    });
});

router.get("/servers", (req: Request, res: Response) => {
  const username = req.query.username;
  settingService
    .getServerSetting()
    .then((result) => {
        const newAuto = result[0].svr_autodownload === 1 ? true : false;
        const newResult = {
            serverPort:result[0].svr_server_port,
            ret:result[0].svr_retention_period,
            auto:newAuto,
            interval:result[0].svr_update_interval
        }
      weasel.log(username, "172.31.168.112", "Success to Get Server Information [Server]");  
      res.send(newResult);
    })
    .catch((error) => {
      weasel.error(username, "172.31.168.112", "Failed to Get Server Information [Server]");
      console.error("update get 에러 : ", error);
      res.status(500).send("update get 하다가 에러났어요");
    });
});

router.post("/agent", (req: Request, res: Response) => {
  const username = req.query.username;
  const agent = req.body;
  settingService
    .modAgentSetting(agent)
    .then((result) => {
      weasel.log(username, "172.31.168.112", "Success to Update Agent Setting [Agent]");
      res.send(result);
    })
    .catch((error) => {
      // console.error("agent setting post 에러 : ", error);
      weasel.error(username, "172.31.168.112", "Failed to Update Agent Setting [Agent]");
      res.status(500).send("agent setting post 하다가 에러났어요");
    });
});

router.get("/agents", (req: Request, res: Response) => {
  const username = req.query.username;
  settingService
    .getAgentSetting()
    .then((result) => {
      weasel.log(username, "172.31.168.112", "Success to Get Agent Information [Agent]");
      res.send(result);
    })
    .catch((error) => {
      weasel.error(username, "172.31.168.112", "Failed to Get Agent Information [Agent]");
      console.error("agent setting get 에러 : ", error);
      res.status(500).send("agent setting get 하다가 에러났어요");
    });
});

router.get("/intervalTime", (req:Request, res:Response) => {
  settingService
    .getIntervalTime()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("intervalTime get 에러 : ", error);
      res.status(500).send("intervalTime get 에러");
    });
  
});

export = router;
