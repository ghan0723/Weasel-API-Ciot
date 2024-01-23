"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const settingService_1 = __importDefault(require("../service/settingService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const settingService = new settingService_1.default();
router.post("/server", (req, res) => {
    const server = req.body;
    settingService
        .modServerSetting(server)
        .then((result) => {
        res.send("업데이트 성공했습니다.");
    })
        .catch((error) => {
        console.error("update 에러 : ", error);
        res.status(500).send("update 하다가 에러났어요");
    });
});
router.post("/agent", (req, res) => {
    const agent = req.body;
    settingService.modAgentSetting(agent)
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
        console.error("agent setting post 에러 : ", error);
        res.status(500).send("agent setting post 하다가 에러났어요");
    });
});
router.get("/agents", (req, res) => {
    settingService
        .getAgentSetting()
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
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
