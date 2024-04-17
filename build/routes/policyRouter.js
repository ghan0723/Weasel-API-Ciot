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
router.get('/add', (req, res) => {
    //이거 정책 이름
    let name = req.query.name;
    //정책을 가지고 새로 만드는 친구는 query를 두번 쓸 생각
    if (name !== undefined && name !== null) {
        //먼저 테스트 케이스를 다 가져온다.
        policyService.getTestCases()
            .then((testcases) => {
            //해당 정책이 체크해둔 테스트 케이스랑 그 파라미터를 가져온다.
            policyService.getTCByPName(name)
                .then((list2) => {
                //교집합인 테스트 케이스를 비교하는 메소드가 필요함
                const datalist = policyService.compareTestCases(testcases, list2);
                res.status(200).send(datalist);
            })
                .catch((list2Error) => {
                res.status(500).send({ message: "정책에서 사용하는 테스트 케이스 db에서 가져오기 실패" });
            });
        })
            .catch((testcasesError) => {
            res.status(500).send({ message: "전체 테스트 케이스 db에서 가져오기 실패" });
        });
    }
    else {
        //아예 새로 만드는거는 테스트 케이스만 다 가져오면 끝
        policyService.getTestCases()
            .then((testcases) => {
            //전체 테스트 케이스를 우리가 원하는 형태로 가공하는 메소드 필요
            const datalist = policyService.compareTestCases(testcases);
            res.status(200).send(datalist);
        })
            .catch((testcasesError) => {
            res.status(500).send({ message: "전체 테스트 케이스 db에서 가져오기 실패" });
        });
    }
});
router.get('/start', (req, res) => {
    const { username, policyname } = req.query;
    policyService.getInsertSessions(username, policyname)
        .then(result => {
        res.send({ result });
    })
        .catch((error) => {
        res.status(500).send(error);
    });
});
router.get('/gp', (req, res) => {
    let username = req.query.username;
    policyService.getGParameter(username)
        .then((gParameter) => {
        res.status(200).send(gParameter[0]);
    })
        .catch((gParameterError) => {
        res.status(500).send({ message: "Global Parameter db에서 가져오기 실패" });
    });
});
router.post('/gp', (req, res) => {
    let username = req.body.username;
    let gParameter = req.body.gParameter;
    policyService.updateGParameter(username, gParameter)
        .then((result) => {
        res.status(200).send(result);
    })
        .catch((updateError) => {
        res.status(500).send({ message: "Global Parameter update 실패" });
    });
});
module.exports = router;
