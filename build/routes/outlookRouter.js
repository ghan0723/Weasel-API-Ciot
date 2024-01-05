"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const outlookService_1 = __importDefault(require("../service/outlookService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const outlookService = new outlookService_1.default();
router.get('/all', (req, res) => {
    outlookService.getCountAll()
        .then((alloutlooks) => {
        console.log("alloutlooks : ", alloutlooks);
        res.send(alloutlooks);
    })
        .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
