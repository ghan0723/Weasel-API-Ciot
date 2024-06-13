import express, { Request, Response, Router } from "express";
import DashboardService from "../service/dashboardService";

const router: Router = express.Router();
const dashboardService: DashboardService = new DashboardService();

router.get("/mostTc", (req:Request, res:Response) => {
    dashboardService.getMostTC()
    .then((mostTcList) => {
        res.status(200).send(mostTcList);
    })
    .catch((mostTcListError) => {
        res.status(500).send(mostTcListError);
    })
})

router.get("/tcResult", (req:Request, res:Response) => {
    dashboardService.tcResultPolicy()
    .then(groupedResults => {
      res.status(200).send([groupedResults]);
    })
    .catch(error => {
        res.status(500).send(error);
    });
})

router.get("/failTC", (req:Request, res:Response) => {
    dashboardService.failTC()
    .then((failTCList) => {
        res.status(200).send(failTCList);
    })
    .catch((failTCListError) => {
        res.status(500).send(failTCListError);
    })
})

router.get("/failSession", (req:Request, res:Response) => {
    dashboardService.failSessionCount()
    .then((failSessions) => {
        res.status(200).send(failSessions);
    })
    .catch((failSessionsError) => {
        res.status(500).send(failSessionsError);
    })
})

router.get("/mostTcPercent", (req:Request, res:Response) => {
    dashboardService.mostTcPolicyPercent()
    .then((mostTcPolicyPercent) => {
        res.status(200).send(mostTcPolicyPercent);
    })
    .catch((mostTcPolicyPercentError) => {
        res.status(500).send(mostTcPolicyPercentError);
    })
})
export = router;