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
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to load Dashboard Page. ");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current Dashboard Page displays data on a ${select}. `);
    res.send("success");
});
router.get("/tables", (req, res) => {
    const username = req.query.username;
    const contents = req.query.contents;
    const category = req.query.category;
    const search = req.query.search;
    if (typeof username !== "string" && typeof contents !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to load Data-Tables Page. ");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current Data-Tables Page displays data on a ${contents + " cate : " + category + " sear : " + search}. `);
    res.send("success");
});
router.get("/logout", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to load LogOut. Out]");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `Success to LogOut ${username}. Out]`);
    res.send("success");
});
router.get("/years", (req, res) => {
    logService.getYears().then((years) => {
        res.send(years);
    });
});
router.get("/months", (req, res) => {
    let year = req.query.year;
    logService.getMonths(year).then((months) => {
        res.send(months);
    });
});
router.get("/day", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    logService.getLogFiles(year, month)
        .then((files) => {
        res.send(files);
    });
});
router.get("/file", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    let file = req.query.file;
    logService.getLogContent(year, month, file)
        .then((content) => {
        log_1.weasel.log("", req.socket.remoteAddress, `Open Log ${file}`);
        res.send([content]);
    })
        .catch((error) => {
        log_1.weasel.error("", req.socket.remoteAddress, "Failed Open Log");
        res.status(401).send("fail");
    });
});
router.get("/error/years", (req, res) => {
    logService.getErrorYears().then((years) => {
        res.send(years);
    });
});
router.get("/error/months", (req, res) => {
    let year = req.query.year;
    logService.getErrorMonths(year).then((months) => {
        res.send(months);
    });
});
router.get("/error/day", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    logService.getErrorLogFiles(year, month)
        .then((files) => {
        res.send(files);
    });
});
router.get("/error/file", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    let file = req.query.file;
    logService.getErrorLogContent(year, month, file)
        .then((content) => {
        log_1.weasel.log("", req.socket.remoteAddress, `Open Log ${file}`);
        res.send([content]);
    })
        .catch((error) => {
        log_1.weasel.error("", req.socket.remoteAddress, "Failed Open Log");
        res.status(401).send("fail");
    });
});
module.exports = router;
