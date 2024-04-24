"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sessionService_1 = __importDefault(require("../service/sessionService"));
const express_1 = __importDefault(require("express"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const router = express_1.default.Router();
const sessionService = new sessionService_1.default();
router.post("/delete", (req, res) => {
    const s_id = req.body.s_id;
    sessionService.deleteSession(s_id)
        .then(() => res.send('success'))
        .catch((error) => res.status(500).send(error));
});
router.get("/all", (req, res) => {
    let category = req.query.category;
    let searchWord = req.query.searchWord;
    sessionService
        .getSessionList(category, searchWord)
        .then((sessionList) => {
        if (sessionList.length > 0) {
            res.status(200).send(sessionList);
        }
        else {
            res.status(200).send([{
                    s_id: "",
                    s_name: "",
                    p_name: "",
                    username: "",
                    s_time: "",
                },]);
        }
    })
        .catch((sessionListError) => {
        //검색이나 무언가 잘못되었을 때 기본 리스트를 넘겨준다.
        res.status(500).send([{
                s_id: "",
                s_name: "",
                p_name: "",
                username: "",
                s_time: "",
            },]);
    });
});
router.get("/data", (req, res) => {
    const s_id = req.query.sid;
    sessionService.getSessionData(s_id)
        .then((result) => {
        sessionService.getSessionLog(s_id)
            .then((sLog) => {
            sessionService.getSessionResult(s_id)
                .then((sResult) => {
                //다 합쳐서 한꺼번에 보내기
                res.status(200).send([result, sLog, sResult]);
            }).catch(error => res.status(500).send(error));
        })
            .catch(error => res.status(500).send(error));
    })
        .catch(error => res.status(500).send(error));
});
router.get('/start', (req, res) => {
    const { username, policyname } = req.query;
    sessionService.getInsertSessions(username, policyname)
        .then(result => {
        res.send(result);
    })
        .catch((error) => {
        res.status(500).send(error);
    });
});
router.get('/stop', (req, res) => {
    let s_id = req.query.sid;
    sessionService.getSessionData(s_id)
        .then((session) => {
        sessionService.updateSessionTime(session[0].s_id, session[0].s_name)
            .then((updateSession) => {
            res.status(200).send(updateSession);
        })
            .catch((updateSessionError) => {
            res.status(500).send({ message: "session time db에서 update 실패" });
        });
    })
        .catch((sessionError) => {
        res.status(500).send({ message: "session 데이터 db에서 가져오기 실패" });
    });
});
router.get('/pdfDwn', (req, res) => {
    let s_id = req.query.sid;
    try {
        sessionService.getSessionData(s_id)
            .then((session) => {
            //로그랑 결과내역 가져오기
            sessionService.getSessionLog(s_id)
                .then((sessionLog) => {
                sessionService.getSessionResult(s_id)
                    .then((sessionResult) => {
                    const pdfDoc = new pdfkit_1.default();
                    // PDF 파일을 메모리에 생성
                    const buffers = [];
                    pdfDoc.on('data', (chunk) => {
                        buffers.push(chunk);
                    });
                    pdfDoc.on('end', () => {
                        const pdfData = Buffer.concat(buffers);
                        // PDF 파일을 클라이언트에게 전송
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('Content-Disposition', `attachment; filename="${session[0].s_name}.pdf"`);
                        res.send(pdfData);
                    });
                    pdfDoc.fontSize(24).text('정책 진행 내역', { align: 'left' });
                    pdfDoc.moveDown(0.5); // 0.5인치 아래로 이동
                    sessionLog.forEach((log) => {
                        pdfDoc.fontSize(11).text(`${log.log_time}: ${log.log_text}`);
                    });
                    pdfDoc.moveDown(3); // 3인치 아래로 이동
                    pdfDoc.fontSize(24).text('점검 결과 집계', { align: 'left' });
                    pdfDoc.moveDown(0.5); // 0.5인치 아래로 이동
                    sessionResult.forEach((result) => {
                        pdfDoc.fontSize(11).text(`${result.r_tc_name}: ${result.r_context}`);
                    });
                    pdfDoc.end();
                })
                    .catch((sessionResultError) => {
                    res.status(500).send({ message: "session 데이터 db에서 가져오기 실패" });
                });
            })
                .catch((sessionLogError) => {
                res.status(500).send({ message: "session 데이터 db에서 가져오기 실패" });
            });
        })
            .catch((sessionError) => {
            res.status(500).send({ message: "session 데이터 db에서 가져오기 실패" });
        });
    }
    catch (error) {
        res.status(500).send('Error generating PDF');
    }
});
module.exports = router;
