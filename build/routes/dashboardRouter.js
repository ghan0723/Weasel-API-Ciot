"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dashboardService_1 = __importDefault(require("../service/dashboardService"));
const router = express_1.default.Router();
const dashboardService = new dashboardService_1.default();
router.get("/mostTc", (req, res) => {
    dashboardService.getMostTC()
        .then((mostTcList) => {
        res.status(200).send(mostTcList);
    })
        .catch((mostTcListError) => {
        res.status(500).send(mostTcListError);
    });
});
router.get("/tcResult", (req, res) => {
    dashboardService.tcResultPolicy()
        .then(groupedResults => {
        res.status(200).send([groupedResults]);
    })
        .catch(error => {
        res.status(500).send(error);
    });
});
router.get("/failTC", (req, res) => {
    dashboardService.failTC()
        .then((failTCList) => {
        res.status(200).send(failTCList);
    })
        .catch((failTCListError) => {
        res.status(500).send(failTCListError);
    });
});
router.get("/failSession", (req, res) => {
    dashboardService.failSessionCount()
        .then((failSessions) => {
        res.status(200).send(failSessions);
    })
        .catch((failSessionsError) => {
        res.status(500).send(failSessionsError);
    });
});
router.get("/mostTcPercent", (req, res) => {
    dashboardService.mostTcPolicyPercent()
        .then((mostTcPolicyPercent) => {
        res.status(200).send(mostTcPolicyPercent);
    })
        .catch((mostTcPolicyPercentError) => {
        res.status(500).send(mostTcPolicyPercentError);
    });
});
module.exports = router;
