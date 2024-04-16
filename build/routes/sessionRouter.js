"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sessionService_1 = __importDefault(require("../service/sessionService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const sessionService = new sessionService_1.default();
router.post("/delete", (req, res) => {
    const { sessionName } = req.body;
    console.log("sessionName : ", sessionName);
    sessionService.deleteSession(sessionName)
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
    const { sessionname, policyname } = req.query;
    console.log('sessionname', sessionname);
    console.log('policyname', policyname);
    sessionService.getSessionData(sessionname, policyname)
        .then(result => {
        console.log('result', result);
        // return res.send(result)
    })
        .catch(error => res.status(500).send(error));
});
module.exports = router;
