"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const userService_1 = __importDefault(require("../service/userService"));
const complexService_1 = __importDefault(require("../service/complexService"));
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const complexService = new complexService_1.default();
router.get("/all", (req, res) => {
    let select = req.query.select;
    let username = req.query.username;
    // Function to fetch data for each service
    function fetchData(serviceName) {
        return userService.getPrivilegeAndIP(username).then((result) => {
            let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
            return complexService.getData(serviceName, select, ipRange);
        });
    }
    Promise.all([
        fetchData("network"),
        fetchData("media"),
        fetchData("outlook"),
        fetchData("print"),
    ])
        .then((dataArray) => {
        res.status(200).send(dataArray);
    })
        .catch((err) => {
        console.error("에러 발생: ", err);
        // If the error has not been handled earlier, send a generic error message
        res.status(500).send("Error fetching data");
    });
});
module.exports = router;
