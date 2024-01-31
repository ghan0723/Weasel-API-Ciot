"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    log_1.weasel.log(username, "172.31.168.112", `The current Data-Tables Page displays data on a ${contents + " cate : " + category + " sear : " + search}. [Data-Tables]`);
    res.send("success");
});
router.get("/logout", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, "172.31.168.112", "Failed to load LogOut. [LogOut]");
        res.send("error");
    }
    log_1.weasel.log(username, "172.31.168.112", `Success to LogOut ${username}. [LogOut]`);
    res.send("success");
});
router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logsData = yield logService.getLogsData();
        res.send(logsData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
}));
module.exports = router;
