"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const userService_1 = __importDefault(require("../service/userService"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const keywordService = new keywordService_1.default();
router.get("/all", (req, res) => {
    let select = req.query.select;
    let username = req.query.username;
    function fetchData(serviceName) {
        return userService.getGradeAndMngip(username).then((result) => {
            let ipRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
            return keywordService.getKeyword(serviceName, select, ipRange);
        });
    }
    Promise.all([
        fetchData("network"),
        fetchData("media"),
        fetchData("outlook"),
    ])
        .then((dataArray) => {
        console.log("dataArray : ", dataArray);
        res.status(200).send("수고");
    })
        .catch((err) => {
        console.error("에러 발생: ", err);
        res.status(500).send("Error fetching data");
    });
});
module.exports = router;
