"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const noticeService_1 = __importDefault(require("../service/noticeService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const noticeService = new noticeService_1.default();
router.get("/popup", (req, res) => {
    noticeService.getPopNotice().then((result) => {
        res.setHeader('Cache-Control', 'public, max-age=10').send(result);
    });
});
module.exports = router;
