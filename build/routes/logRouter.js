"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const logService_1 = __importDefault(require("../service/logService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const logService = new logService_1.default();
router.get("/dashboard", (req, res) => {
    const select = req.query.select;
    const username = req.query.username;
    if (typeof username !== "string" && typeof select !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the dashboard page.");
        // weasel.error(username, req.socket.remoteAddress, "Dashboard 페이지에 접근 할 수 없습니다.");
        res.status(500).send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current dashboard page displays data on a ${select}.`);
    // weasel.log(username,req.socket.remoteAddress,`현재 대시보드 페이지에 ${select}에 데이터가 표시됩니다.`);
    res.send("success");
});
router.get("/tables", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the dataTable page.");
        // weasel.error(username, req.socket.remoteAddress,"유출탐지내역 페이지에 접근 할 수 없습니다.");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current data-tables page displays data.`);
    // weasel.log(username,req.socket.remoteAddress,`유출탐지내역 메뉴입니다.`);
    res.send("success");
});
router.get("/leaked", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the leackedTable page.");
        // weasel.error(username, req.socket.remoteAddress,  "관리대상목록 페이지에 접근 할 수 없습니다.");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current leackedTable page displays data.`);
    // weasel.log(username,req.socket.remoteAddress,`관리대상 목록 메뉴입니다.`);
    res.send("success");
});
router.get("/analysis", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the analysis page.");
        // weasel.error(username, req.socket.remoteAddress, "분석 페이지에 접근 할 수 없습니다.");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `The current analysis page displays.`);
    // weasel.log(username,req.socket.remoteAddress,`분석 메뉴입니다.`);
    res.send("success");
});
router.get("/logout", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Logout failed.");
        // weasel.error(username, req.socket.remoteAddress, "로그아웃 시도 중에 서버에서 예기치 않은 오류가 발생하여 서버가 중단되었습니다.");
        res.send("error");
    }
    log_1.weasel.log(username, req.socket.remoteAddress, `Logout for ${username} was successful.`);
    // weasel.log(username,req.socket.remoteAddress,`${username}의 로그아웃이 되었습니다.`);
    res.send("success");
});
// 로그 페이지 관련...
// 감사로그
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
    logService.getLogFiles(year, month).then((files) => {
        res.send(files);
    });
});
router.get("/file", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    let file = req.query.file;
    const username = req.query.username;
    logService
        .getLogContent(year, month, file)
        .then((content) => {
        log_1.weasel.log(username, req.socket.remoteAddress, `${file} audit log`);
        // weasel.log("", req.socket.remoteAddress, `${file} 감사 로그입니다`);
        res.send([content]);
    })
        .catch(() => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to view audit log");
        // weasel.error("", req.socket.remoteAddress,"감사 로그 보기 실패");
        res.status(401).send("fail");
    });
});
// 에러 로그
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
    logService.getErrorLogFiles(year, month).then((files) => {
        res.send(files);
    });
});
router.get("/error/file", (req, res) => {
    let year = req.query.year;
    let month = req.query.month;
    let file = req.query.file;
    const username = req.query.username;
    logService
        .getErrorLogContent(year, month, file)
        .then((content) => {
        log_1.weasel.log(username, req.socket.remoteAddress, `${file} error log`);
        // weasel.log("", req.socket.remoteAddress, `${file} 에러 로그입니다`);
        res.send([content]);
    })
        .catch(() => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to view error log");
        // weasel.error("", req.socket.remoteAddress,"에러 로그 보기 실패");
        res.status(401).send("fail");
    });
});
router.get("/screenshot", (req, res) => {
    const username = req.query.username;
    const fileName = req.query.fileName;
    if (fileName !== undefined && fileName !== null) {
        log_1.weasel.log(username, req.socket.remoteAddress, `Download screenshot : ${fileName}`);
        // weasel.log(username, req.socket.remoteAddress, `스크린샷 다운로드 : ${fileName}`);
    }
    else {
        log_1.weasel.error(username, req.socket.remoteAddress, `Unable to download screenshot : ${fileName}`);
        // weasel.error(username, req.socket.remoteAddress, `스크린샷을 다운로드하는데 실패했습니다.`);
    }
    res.send("make log");
});
router.get("/download", (req, res) => {
    const username = req.query.username;
    const fileName = req.query.fileName;
    if (fileName !== undefined && fileName !== null) {
        log_1.weasel.log(username, req.socket.remoteAddress, `Download file : ${fileName}`);
        // weasel.log(username, req.socket.remoteAddress, `파일 다운로드 : ${fileName}`);
    }
    else {
        log_1.weasel.error(username, req.socket.remoteAddress, `Unable to download file : ${fileName}`);
        // weasel.error(username, req.socket.remoteAddress, `파일을 다운로드하는데 실패했습니다.`);
    }
    res.send("make log");
});
router.get("/userList", (req, res) => {
    const username = req.query.username;
    if (typeof username !== "string") {
        log_1.weasel.error(username, req.socket.remoteAddress, "Unable to display the userlist control page.");
        // weasel.error(username, req.socket.remoteAddress, "사용자 관리 페이지에 접근 할 수 없습니다.");
        res.status(500).send("error");
    }
    else {
        log_1.weasel.log(username, req.socket.remoteAddress, `The userlist control page displays data.`);
    }
    res.send("make log");
});
module.exports = router;
