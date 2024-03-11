"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const multer_1 = __importDefault(require("multer"));
const log_1 = require("../interface/log");
const settingService_1 = __importDefault(require("../service/settingService"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const settingService = new settingService_1.default();
let existFile = "";
// Multer 저장소 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "C:/ciot/updates/");
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname); // 확장자 추출
        let filename = path_1.default.basename(file.originalname, ext) + ext;
        const fullPath = path_1.default.join("C:/ciot/updates/", filename);
        existFile = "";
        if (fs_1.default.existsSync(fullPath)) {
            existFile = path_1.default.join("C:/ciot/updates/", filename);
            filename = path_1.default.basename(file.originalname, ext) + "_1" + ext;
            cb(null, filename);
        }
        else {
            cb(null, filename);
        }
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
});
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
            interval: result[0].svr_ui_refresh_interval,
            svr_patterns_list: result[0].svr_patterns_list,
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
        settingService
            .getUpdateFileAgent()
            .then((result2) => {
            log_1.weasel.log(username, req.socket.remoteAddress, "Success to Get Agent Information ");
            res.send([result, result2]);
        })
            .catch((error2) => {
            log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Get Agent Information ");
            console.error("agent setting get 에러 : ", error2);
            res.status(500).send("agent setting get 하다가 에러났어요");
        });
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
router.get("/process", (req, res) => {
    settingService
        .getProcessAccuracy()
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
        console.error("get process 에러 : ", error);
        res.status(500).send("get process 에러");
    });
});
router.post("/process", (req, res) => {
    const newProcName = req.body.procName;
    const username = req.query.username;
    settingService
        .addProcessAccuracy(newProcName)
        .then((result) => {
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Add ProcessAccuracy");
        res.send(result);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Add ProcessAccuracy");
        res.status(500).send("Add ProcessAccuracy 하다가 에러났어요");
    });
});
router.post("/delete", (req, res) => {
    const username = req.query.username;
    const procName = req.body.procName;
    settingService
        .deleteProcessAccuracy(procName)
        .then((result) => {
        log_1.weasel.log(username, req.socket.remoteAddress, "Success to Delete ProcessAccuracy");
        res.send(result);
    })
        .catch((error) => {
        log_1.weasel.error(username, req.socket.remoteAddress, "Failed to Delete ProcessAccuracy");
        res.status(500).send("Delete ProcessAccuracy 하다가 에러났어요");
    });
});
router.post("/fileUpdate", upload.single("file"), (req, res) => {
    let processFile = false;
    if (req.file) {
        const ext = path_1.default.extname(req.file.path); // 확장자 추출
        if (ext === ".pdf") {
            // 현재 경로에 이름이 겹치는 파일이 있는 경우
            if (existFile !== "") {
                // 파일 처리 함수를 지연 시간 후에 실행
                const delayTime = 300;
                setTimeout(() => {
                    var _a;
                    processFile = settingService.processFile((_a = req.file) === null || _a === void 0 ? void 0 : _a.path, existFile);
                }, delayTime);
            }
            // PDF 파일인 경우
            res.status(200).send("PDF 파일 업로드 성공!");
        }
        else {
            // PDF 파일이 아닌 경우 파일 삭제
            fs_1.default.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('파일 삭제 중 오류 발생:', err);
                    res.status(500).send('파일 삭제 중 오류 발생');
                }
                else {
                    res.status(200).send('PDF 파일이 아닙니다.');
                }
            });
        }
    }
    else {
        res.status(400).send("PDF 파일이 아닙니다.");
    }
});
router.get("/updateFile", (req, res) => {
    settingService
        .getUpdateFileAgent()
        .then((result) => {
        res.send(result);
    })
        .catch((error) => {
        res.status(500).send("get UpdateAgentFile 하다가 에러났어요");
    });
});
router.post("/updateFile", (req, res) => {
    const username = req.body.username;
    const updateFile = req.body.updateFile.split('\\').pop();
    settingService
        .postUpdateFileAgent(updateFile)
        .then(() => {
        res.send(updateFile);
    })
        .catch(() => {
        res.status(500).send("post UpdateAgentFile error");
    });
});
router.get("/outlook", (req, res) => {
    const username = req.query.username;
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
module.exports = router;
