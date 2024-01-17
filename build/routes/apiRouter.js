"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const db_1 = __importDefault(require("../db/db"));
const mediaService_1 = __importDefault(require("../service/mediaService"));
const networkService_1 = __importDefault(require("../service/networkService"));
const outlookService_1 = __importDefault(require("../service/outlookService"));
const printService_1 = __importDefault(require("../service/printService"));
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const userService_1 = __importDefault(require("../service/userService"));
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const mediaService = new mediaService_1.default();
const outlookService = new outlookService_1.default();
const printService = new printService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
// 송신테이블 호출
router.get("/", (req, res) => {
    const contents = req.query.contents;
    const page = req.query.page; // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    let ipRanges;
    userService.getGradeAndMngip(username)
        .then(result => {
        let results;
        ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
        console.log('ipRange : ', ipRanges);
        if (contents === "network") {
            results = networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges);
        }
        else if (contents === "media") {
            results = mediaService.getApiData(page, pageSize);
        }
        else if (contents === "outlook") {
            results = outlookService.getApiData();
        }
        else if (contents === "print") {
            results = printService.getApiData();
        }
        else {
            // Handle the case when param doesn't match any of the expected values
            console.error("Invalid param:", contents);
        }
        results === null || results === void 0 ? void 0 : results.then((DataItem) => {
            res.send(DataItem);
        }).catch((error) => {
            console.error(error + " : " + contents);
            res.status(500).send("server error");
        });
    })
        .catch(error => {
        console.error("ipRange error : ", error);
    });
});
// dummy data 생성
router.get('/dummy', (req, res) => {
    const contents = req.query.contents;
    const count = req.query.count;
    // const page = req.query.page;         // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    console.log("dummy : ", contents);
    switch (contents) {
        case 'network':
            networkService.getDummyData(count)
                .then(() => {
                getApiDataLogic(contents, 0, pageSize, sorting, desc, category, search, username, req, res);
            })
                .catch((error) => {
                console.error(error + " : " + contents);
                res.status(500).send("server error");
            });
            break;
    }
});
// data 다중 삭제
router.post('/rm', (req, res) => {
    const contents = req.query.contents;
    // const page = req.query.page;         // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    const body = req.body;
    switch (contents) {
        case 'network':
            networkService.postRemoveData(body)
                .then(() => {
                getApiDataLogic(contents, 0, pageSize, sorting, desc, category, search, username, req, res);
            })
                .catch((error) => {
                console.error(error + " : " + contents);
                res.status(500).send("server error");
            });
            break;
    }
});
// 송신탐지 외 getApiData Logic
function getApiDataLogic(contents, page, pageSize, sorting, desc, category, search, username, req, res) {
    let ipRanges;
    userService.getGradeAndMngip(username)
        .then(result => {
        let results;
        ipRanges = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
        console.log('ipRange : ', ipRanges);
    });
    switch (contents) {
        case 'network':
            networkService.getApiData(page, pageSize, sorting, desc, category, search, username)
                .then(result => {
                res.send(result);
            })
                .catch((error) => {
                console.error("getApiDataLogic(network) : " + error);
                res.status(500).send("server error");
            });
            break;
    }
}
module.exports = router;
