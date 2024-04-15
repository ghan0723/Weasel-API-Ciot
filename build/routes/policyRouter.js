"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const policyService_1 = __importDefault(require("../service/policyService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const policyService = new policyService_1.default();
router.get('/list', (req, res) => {
    policyService.getPolicyList()
        .then(list => {
        res.send(list);
    })
        .catch((error) => {
        res.status(500).send({ error: error });
    });
});
// tc upload
router.post('/upload', (req, res) => {
    const data = req.body;
    console.log('data', data);
    // policyService.getPolicyList()
    // .then(list => {
    //     res.send(list);
    // })
    // .catch((error:any) => {
    //     res.status(500).send({error : error});
    // })
});
module.exports = router;
