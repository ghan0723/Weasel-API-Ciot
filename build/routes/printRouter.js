"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const printService_1 = __importDefault(require("../service/printService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const printService = new printService_1.default();
router.get('/all', (req, res) => {
    printService.getCountAll()
        .then((allprints) => {
        res.send(allprints);
    })
        .catch((error) => {
        console.error('에러 발생:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
