"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userService_1 = __importDefault(require("../service/userService"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const logService_1 = __importDefault(require("../service/logService"));
const log_1 = require("../interface/log");
const settingService_1 = __importDefault(require("../service/settingService"));
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const logService = new logService_1.default();
const settingService = new settingService_1.default();
router.get("/dashboard", (req, res) => {
    const select = req.query.select;
    const username = req.query.username;
    if (typeof username !== "string" && typeof select !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the dashboard page");
        res.status(500).send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current dashboard page displays data on a ${select}. `);
    settingService.getOutlookFlag()
        .then((result) => {
        if ((result[0].flag & 256) === 256) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to retrieve outlook flag value");
        res.status(500).send("error");
    });
});
router.get("/tables", (req, res) => {
    const username = req.query.username;
    const contents = req.query.contents;
    const category = req.query.category;
    const search = req.query.search;
    if (typeof username !== "string" && typeof contents !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the dataTable page");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current data-tables page displays data on a ${contents + " category : " + category + " searchWord : " + search}. `);
    settingService.getOutlookFlag()
        .then((result) => {
        if ((result[0].flag & 256) === 256) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    })
        .catch(() => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to retrieve outlook flag value");
        res.status(500).send("error");
    });
});
router.get("/leaked", (req, res) => {
    const username = req.query.username;
    const category = req.query.category;
    const search = req.query.search;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the leackedTable page");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current leackedTable page displays data on a ${"leaked category : " + category + " searchWord : " + search}. `);
    res.send("success");
});
router.get("/analysis", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the analysis page.");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current analysis page displays.`);
    res.send("success");
});
router.get("/logout", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Logout failed");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `Logout for ${username} was successful. `);
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
        log_1.weasel.log("", req.socket.remoteAddress, `Verified ${file} audit log`);
        res.send([content]);
    })
        .catch((error) => {
        log_1.weasel.error("", req.socket.remoteAddress, "Failed to retrieve the audit log");
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
        log_1.weasel.log("", req.socket.remoteAddress, `Verified ${file} error log`);
        res.send([content]);
    })
        .catch((error) => {
        log_1.weasel.error("", req.socket.remoteAddress, "Failed to retrieve the error log");
        res.status(401).send("fail");
    });
});
module.exports = router;
