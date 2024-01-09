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
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const mediaService = new mediaService_1.default();
const outlookService = new outlookService_1.default();
const printService = new printService_1.default();
router.get("/:url", (req, res) => {
    let param = req.params.url;
    console.log("url : ", param);
    let results;
    if (param === ":network") {
        results = networkService.getApiData();
    }
    else if (param === ":media") {
        results = mediaService.getApiData();
    }
    else if (param === ":outlook") {
        results = outlookService.getApiData();
    }
    else if (param === ":print") {
        results = printService.getApiData();
    }
    else {
        // Handle the case when param doesn't match any of the expected values
        console.error("Invalid param:", param);
    }
    results === null || results === void 0 ? void 0 : results.then((DataItem) => {
        res.send(DataItem);
    }).catch((error) => {
        console.error(error + " : " + param);
        res.status(500).send("server error");
    });
});
module.exports = router;
