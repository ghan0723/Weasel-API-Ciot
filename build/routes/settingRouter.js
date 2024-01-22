"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const settingService_1 = __importDefault(require("../service/settingService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const settingService = new settingService_1.default();
router.post('/server', (req, res) => {
    const server = req.body;
    console.log("server 잘 들어왔나 ?  : ", server);
    res.send("잘 들어왔습니다.");
});
router.post('/agent', (req, res) => {
    const agent = req.body;
    console.log("agent 잘 들어왔나 ?  : ", agent);
    res.send("잘 들어왔습니다.");
});
module.exports = router;
