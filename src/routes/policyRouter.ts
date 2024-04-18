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

router.get('/add', (req:Request, res:Response) => {
    //이거 정책 이름
    let name = req.query.name;
    //정책을 가지고 새로 만드는 친구는 query를 두번 쓸 생각
    if(name !== undefined && name !== null){
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
                res.status(500).send({message : "정책에서 사용하는 테스트 케이스 db에서 가져오기 실패"});
            })
        })
        .catch((testcasesError) => {
            res.status(500).send({message : "전체 테스트 케이스 db에서 가져오기 실패"});
        })
    } else {
        //아예 새로 만드는거는 테스트 케이스만 다 가져오면 끝
        policyService.getTestCases()
        .then((testcases) => {
            //전체 테스트 케이스를 우리가 원하는 형태로 가공하는 메소드 필요
            const datalist = policyService.compareTestCases(testcases);
            res.status(200).send(datalist);
        })
        .catch((testcasesError) => {
            res.status(500).send({message : "전체 테스트 케이스 db에서 가져오기 실패"});
        })        
    }
});

router.post('/add', (req:Request, res:Response) => {
    const treeData = req.body.treeData;
    const policyName = req.body.policyName;
    const username = req.body.username;
    const policyDescription = req.body.policyDescription;
    //정책 저장하기 전에 중복 검사부터
    policyService.duplicatePolicy(policyName)
    .then((dup) => {
        if(dup){
            //중복된 이름을 가진 정책임
            res.status(200).send({dup:true});
        } else {
            //중복되지 않았으니까 먼저 정책부터 저장한다.
            policyService.addPolicy(username, policyName, policyDescription)
            .then((addPolicy) => {
                //정책을 만들었으니 해당 정책이 테스트할 tc랑 parameter 저장한다.
                policyService.addTcPolicy(policyName, treeData)
                .then((addTcPolicy) => {
                    res.status(200).send(addTcPolicy);
                })
                .catch((addTcPolicyError) => {
                    res.status(500).send({message : "tc_policy에 tc 추가 실패"});
                })
            })
            .catch((addPolicyError) => {
                res.status(500).send({message : "새로운 점검 정책 db에 저장 실패"});
            })
        }        
    })
    .catch((dupError) => {
        res.status(500).send(dupError);
    })
})

router.post('/start', (req:Request, res:Response) => {
    const {username, policyname} = req.query;
    let gParameter = req.body.gParameter;
    let treeData = req.body.treeData;
    let policyDescription = req.body.policyDescription;
    //방금 등록한 정책명으로 새로 session을 만들어주면 된다.
    policyService.getInsertSessions(username,policyname)
    .then(result => {
        res.send({result});
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

router.get('/gp', (req:Request, res:Response) => {
    let username = req.query.username;
    policyService.getGParameter(username)
    .then((gParameter) => {
        res.status(200).send(gParameter[0]);
    })
    .catch((gParameterError) => {
        res.status(500).send({message : "Global Parameter db에서 가져오기 실패"});
    })
});

router.post('/gp', (req:Request, res:Response) => {
    let username = req.body.username;
    let gParameter = req.body.gParameter;
    policyService.updateGParameter(username, gParameter)
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((updateError) => {
        res.status(500).send({message : "Global Parameter update 실패"});
    })
})

router.get('/edit', (req:Request, res:Response) => {
    //이거 정책 이름
    let name = req.query.name;
    //정책을 가지고 새로 만드는 친구는 query를 두번 쓸 생각

    //먼저 테스트 케이스를 다 가져온다.
    policyService.getTestCases()
    .then((testcases) => {
        //해당 정책이 체크해둔 테스트 케이스랑 그 파라미터를 가져온다.
        policyService.getTCByPName(name)
        .then((list2) => {
            //교집합인 테스트 케이스를 비교하는 메소드가 필요함
            const datalist = policyService.compareTestCases(testcases, list2);
            policyService.getPolicyDescription(name)
            .then((policyDescription) => {
                res.status(200).send([datalist, policyDescription]);
            })
            .catch((policyDescriptionError) => {
                res.status(500).send({message : "정책 설명 db에서 가져오기 실패"});
            })
        })
        .catch((list2Error) => {
            res.status(500).send({message : "정책에서 사용하는 테스트 케이스 db에서 가져오기 실패"});
        })
    })
    .catch((testcasesError) => {
        res.status(500).send({message : "전체 테스트 케이스 db에서 가져오기 실패"});
    })
});

export = router;