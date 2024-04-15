import PolicyService from "../service/policyService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const policyService:PolicyService = new PolicyService();

router.get('/list', (req:Request, res:Response) => {
    policyService.getPolicyList()
    .then(list => {
        res.send(list);
    })
    .catch((error:any) => {
        res.status(500).send({error : error});
    })

});

// tc upload
router.post('/upload', (req:Request, res:Response) => {
    const data = req.body;
    console.log('data',data);
    
    // policyService.getPolicyList()
    // .then(list => {
    //     res.send(list);
    // })
    // .catch((error:any) => {
    //     res.status(500).send({error : error});
    // })

});

export = router;