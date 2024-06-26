"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path = __importStar(require("path"));
const db_1 = __importDefault(require("../db/db"));
const mediaService_1 = __importDefault(require("../service/mediaService"));
const networkService_1 = __importDefault(require("../service/networkService"));
const outlookService_1 = __importDefault(require("../service/outlookService"));
const printService_1 = __importDefault(require("../service/printService"));
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const userService_1 = __importDefault(require("../service/userService"));
const leakedService_1 = __importDefault(require("../service/leakedService"));
const log_1 = require("../interface/log");
const router = express_1.default.Router();
const networkService = new networkService_1.default(db_1.default);
const mediaService = new mediaService_1.default();
const outlookService = new outlookService_1.default();
const printService = new printService_1.default();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const leakedService = new leakedService_1.default();
// 송신테이블 호출
router.get("/", (req, res) => {
    const contents = req.query.contents;
    const page = req.query.page; // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    let ipRanges;
    if (username === undefined || username === 'undefined') {
        res.status(200).send("username undefined");
    }
    else {
        userService.getPrivilegeAndIP(username)
            .then(result => {
            let results;
            ipRanges = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
            if (contents === "network") {
                results = networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
            }
            else if (contents === "media") {
                results = mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
            }
            else if (contents === "outlook") {
                results = outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
            }
            else if (contents === "print") {
                results = printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
            }
            else {
                // Handle the case when param doesn't match any of the expected values
                console.error("Invalid param:", contents);
            }
            results === null || results === void 0 ? void 0 : results.then((DataItem) => {
                res.send(DataItem);
            }).catch((error) => {
                console.error(error + " : " + contents);
                res.status(500).send("server error");
            });
        })
            .catch(error => {
            console.error("ipRange error : ", error);
            res.status(500).send("ipRange error");
        });
    }
});
router.get("/refresh", (req, res) => {
    const contents = req.query.contents;
    const id = req.query.id;
    const name = req.query.name;
    let results;
    if (contents === "network") {
        results = networkService.getUpdateUpLoad(id, name);
    }
    else if (contents === "media") {
        results = mediaService.getUpdateUpLoad(id);
    }
    else if (contents === "outlook") {
        results = outlookService.getUpdateUpLoad(id);
    }
    else if (contents === "print") {
        results = printService.getUpdateUpLoad(id);
    }
    results === null || results === void 0 ? void 0 : results.then(() => {
        res.send('success');
    }).catch(() => {
        res.status(500).send(contents + " server error");
    });
});
// dummy data 생성
router.get('/dummy', (req, res) => {
    let results;
    const contents = req.query.contents;
    const count = req.query.count;
    // const page = req.query.page;         // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    switch (contents) {
        case 'network':
            results = networkService.getDummyData(count);
            break;
        case 'media':
            results = mediaService.getDummyData(count);
            break;
        case 'outlook':
            results = outlookService.getDummyData(count);
            break;
        case 'print':
            results = printService.getDummyData(count);
            break;
        case 'leaked':
            results = leakedService.getDummyData(count);
            break;
    }
    results === null || results === void 0 ? void 0 : results.then(() => {
        getApiDataLogic(contents, 0, pageSize, sorting, desc, category, search, username, req, res);
    }).catch((error) => {
        console.error(error + " : " + contents);
        res.status(500).send(contents + " server error");
    });
});
// data 다중 삭제
router.post('/rm', (req, res) => {
    let results;
    const contents = req.query.contents;
    // const page = req.query.page;         // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    const body = req.body;
    switch (contents) {
        case 'network':
            results = networkService.postRemoveData(body);
            break;
        case 'media':
            results = mediaService.postRemoveData(body);
            break;
        case 'outlook':
            results = outlookService.postRemoveData(body);
            break;
        case 'print':
            results = printService.postRemoveData(body);
            break;
    }
    results === null || results === void 0 ? void 0 : results.then(() => {
        getApiDataLogic(contents, 0, pageSize, sorting, desc, category, search, username, req, res);
        log_1.weasel.log(username, req.ip, `[Info] The user, '${username}' deleted ${body.length} data in ${contents}.`);
        // weasel.log(username, req.ip, `${contents}의 ${results.length}개 데이터를 삭제하였습니다.`);
    }).catch((error) => {
        log_1.weasel.error(username, req.ip, `[Error] The user, '${username}' deleted ${body.length} pieces of data in ${contents} fail.`);
        // weasel.error(username, req.ip, `${contents}의 ${results.length}개 데이터를 삭제하는데 실패하였습니다.`);
        console.error(error + " : " + contents);
        res.status(500).send(contents + " server error");
    });
});
// 송신탐지 외 getApiData Logic
function getApiDataLogic(contents, page, pageSize, sorting, desc, category, search, username, req, res) {
    let ipRanges;
    userService.getPrivilegeAndIP(username)
        .then(result => {
        let results;
        ipRanges = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
        switch (contents) {
            case 'network':
                results = networkService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
                break;
            case 'media':
                results = mediaService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
                break;
            case 'outlook':
                results = outlookService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
                break;
            case 'print':
                results = printService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, result[0].privilege);
                break;
        }
        results === null || results === void 0 ? void 0 : results.then((DataItem) => {
            res.send(DataItem);
        }).catch((error) => {
            console.error(`getApiDataLogic(${contents}) error`);
            res.status(500).send("server error");
        });
    });
}
// 송신테이블 호출
router.get("/leaked", (req, res) => {
    const page = req.query.page; // page count
    const pageSize = req.query.pageSize; // page 갯수
    const sorting = req.query.sorting; // sort column
    const desc = req.query.desc; // desc : false, asc : true, undefined
    const category = req.query.category; // search column
    const search = req.query.search; // search context
    const username = req.query.username; // username
    let ipRanges;
    if (username === undefined || username === 'undefined') {
        res.status(200).send("username undefined");
    }
    else {
        userService.getPrivilegeAndIP(username)
            .then(result => {
            var _a;
            ipRanges = ipCalcService_1.default.parseIPRange(result[0].ip_ranges);
            (_a = leakedService.getApiData(page, pageSize, sorting, desc, category, search, ipRanges, false)) === null || _a === void 0 ? void 0 : _a.then((DataItem) => {
                res.send([DataItem, result[0].privilege]);
            }).catch((error) => {
                res.status(500).send("server error");
            });
        })
            .catch(error => {
            res.status(500).send("ipRange error");
        });
    }
});
router.post("/decfile", (req, res) => {
    const fileId = req.body.fileId;
    const filePath = req.body.filePath;
    // /Detects 부분을 실제 파일 시스템 경로로 변환
    const baseDir = 'C:/Program Files (x86)/ciot/WeaselServer/Temp';
    const fullPath = [];
    for (let i = 0; i < filePath.length; i++) {
        const relativePath = filePath[i].replace('/Detects', '');
        fullPath.push(path.join(baseDir, relativePath));
    }
    networkService.getPcGUID(fileId)
        .then((pc_guid) => {
        networkService.fileDecrypt(fullPath, pc_guid[0].pc_guid)
            .then((filename) => {
            res.status(200).send();
        })
            .catch(() => {
            console.log('fileDecrypt error');
            res.status(500).send({ error: 'fileError' });
        });
    })
        .catch(() => {
        console.log('pcGUID 못 가지고 오는 에러');
        res.status(500).send({ error: 'error' });
    });
});
router.post("/deleteDecfile", (req, res) => {
    const downloadPath = req.body.filePath;
    // /Detects 부분을 실제 파일 시스템 경로로 변환
    const baseDir = 'C:/Program Files (x86)/ciot/WeaselServer/Temp';
    const fullPath = [];
    for (let i = 0; i < downloadPath.length; i++) {
        const relativePath = downloadPath[i].replace('/Detects', '');
        fullPath.push(path.join(baseDir, relativePath));
    }
    networkService.deleteFileDecrypt(fullPath)
        .then(() => {
        res.status(200);
    })
        .catch(() => {
        res.status(500);
    });
});
router.post("/leaked", (req, res) => {
    const updateData = req.body;
    leakedService.modLeakedAgent(updateData.columnId, updateData.value, updateData.original.pc_guid)
        .then((result) => {
        res.status(200).send("성공");
    })
        .catch((leakedAgentError) => {
        res.status(500).send({ leakedAgentError: 'error' });
    });
});
module.exports = router;
