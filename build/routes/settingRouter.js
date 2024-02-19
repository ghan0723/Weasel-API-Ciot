"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const log_1 = require("../interface/log");
const settingService_1 = __importDefault(require("../service/settingService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const settingService = new settingService_1.default();
router.post("/server", (req, res) => {
    const username = req.query.username;
    const server = req.body;
    settingService
        .modServerSetting(server)
        .then((result) => {
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Update Server Setting ");
        res.send("업데이트 성공했습니다.");
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Update Server Setting ");
        console.error("update 에러 : ", error);
        res.status(500).send("update 하다가 에러났어요");
    });
});
router.get("/servers", (req, res) => {
    const username = req.query.username;
    settingService
        .getServerSetting()
        .then((result) => {
        const newAuto = result[0].svr_auto_fileupload === 1 ? true : false;
        const newResult = {
            serverPort: result[0].svr_port,
            ret: result[0].svr_file_retention_periods,
            auto: newAuto,
            interval: result[0].svr_ui_refresh_interval
        };
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Get Server Information ");
        res.send(newResult);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Get Server Information ");
        console.error("update get 에러 : ", error);
        res.status(500).send("update get 하다가 에러났어요");
    });
});
router.post("/agent", (req, res) => {
    const username = req.query.username;
    const agent = req.body;
    settingService
        .modAgentSetting(agent)
        .then((result) => {
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Update Agent Setting ");
        res.send(result);
    })
        .catch((error) => {
        // console.error("agent setting post 에러 : ", error);
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Update Agent Setting ");
        res.status(500).send("agent setting post 하다가 에러났어요");
    });
});
router.get("/agents", (req, res) => {
    const username = req.query.username;
    settingService
        .getAgentSetting()
        .then((result) => {
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Get Agent Information ");
        res.send(result);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Get Agent Information ");
        console.error("agent setting get 에러 : ", error);
        res.status(500).send("agent setting get 하다가 에러났어요");
    });
});
router.get("/intervalTime", (req, res) => {
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
module.exports = router;
