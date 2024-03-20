"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const barService_1 = __importDefault(require("../service/barService"));
const express_1 = __importDefault(require("express"));
const userService_1 = __importDefault(require("../service/userService"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const router = express_1.default.Router();
const barService = new barService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
router.get("/count", (req, res) => {
    let select = req.query.select;
    let username = req.query.username;
    let barData = [];
    // Function to fetch data for each service
    function fetchData(serviceName) {
        return userService
            .getPrivilegeAndIP(username)
            .then((result) => {
            let ipRange = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
            return barService.getBarData(serviceName, select, ipRange);
        });
    }
    // Fetch data for each service concurrently
    Promise.all([
        fetchData("network"),
        fetchData("media"),
        fetchData("outlook"),
        fetchData("print"),
    ])
        .then((dataArray) => {
        barData = dataArray.map((data) => ({
            name: data.table,
            data: data.data.map((item) => item.totalCount),
            category: data.data.map((item) => item.agentip),
        }));
        res.status(200).send(barData);
    })
        .catch((err) => {
        // If the error has not been handled earlier, send a generic error message
        res.status(500).send("Error fetching data");
    });
});
module.exports = router;
