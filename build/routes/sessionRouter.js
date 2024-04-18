"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sessionService_1 = __importDefault(require("../service/sessionService"));
const express_1 = __importDefault(require("express"));
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
        res.status(200).send(result);
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
module.exports = router;
