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
router.get("/", (req, res) => {
    const contents = req.query.contents;
    const page = req.query.page; // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    console.log("contents : ", contents);
    console.log("page : ", page);
    console.log("pageSize : ", pageSize);
    console.log("sorting : ", sorting);
    console.log("desc : ", desc);
    console.log("category : ", category);
    console.log("search : ", search);
    console.log("page type : ", typeof (page));
    console.log("page type : ", typeof (pageSize));
    let results;
    if (contents === "network") {
        results = networkService.getApiData(page, pageSize, sorting, desc, category, search);
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
});
module.exports = router;
