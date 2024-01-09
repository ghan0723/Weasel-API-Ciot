"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mediaService_1 = __importDefault(require("../service/mediaService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const mediaService = new mediaService_1.default();
router.get("/all/:select", (req, res) => {
    let select = req.params.select;
    mediaService
        .getMediaAll(select)
        .then((allmedias) => {
        res.send(allmedias);
    })
        .catch((error) => {
        console.error("에러 발생:", error);
        res.status(500).send("Internal Server Error");
    });
});
module.exports = router;
