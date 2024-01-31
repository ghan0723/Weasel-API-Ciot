"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userService_1 = __importDefault(require("../service/userService"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const logService_1 = __importDefault(require("../service/logService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const logService = new logService_1.default();
router.get("/dashboard", (req, res) => {
    const select = req.query.select;
    const username = req.query.username;
    if (typeof username !== "string" && typeof select !== "string") {
        log_1.weasel.error(username, "172.31.168.112", "Failed to load Dashboard Page. [Dashboard]");
        res.send("error");
    }
    log_1.weasel.log(username, "172.31.168.112", `The current Dashboard Page displays data on a ${select}. [Dashboard]`);
    res.send("success");
});
router.get("/tables", (req, res) => {
    const username = req.query.username;
    const contents = req.query.contents;
    const category = req.query.category;
    const search = req.query.search;
    if (typeof username !== "string" && typeof contents !== "string") {
        log_1.weasel.error(username, "172.31.168.112", "Failed to load Data-Tables Page. [Data-Tables]");
        res.send("error");
    }
    log_1.weasel.log(username, "172.31.168.112", `The current Data-Tables Page displays data on a ${contents + ' cate : ' + category + ' sear : ' + search}. [Data-Tables]`);
    res.send("success");
});
module.exports = router;
