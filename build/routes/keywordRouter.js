"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const ipCalcService_1 = __importDefault(require("../service/ipCalcService"));
const userService_1 = __importDefault(require("../service/userService"));
const keywordService_1 = __importDefault(require("../service/keywordService"));
const router = express_1.default.Router();
const userService = new userService_1.default();
const ipCalcService = new ipCalcService_1.default();
const keywordService = new keywordService_1.default();
router.get("/all", (req, res) => {
    let select = req.query.select;
    let username = req.query.username;
    let outlookFlag = req.query.outlookFlag;
    let keywordList = [];
    function fetchData(serviceName) {
        return userService.getPrivilegeAndIP(username).then((result) => {
            let ipRange = ipCalcService.parseIPRange(result[0].ip_ranges);
            return keywordService.getKeywordList().then((result2) => {
                keywordList = result2;
                return keywordService.getKeyword(serviceName, select, ipRange, keywordList);
            });
        });
    }
    function mergeKeywordCounts(dataArray) {
        const mergedDataMap = new Map();
        // dataArray의 각 배열에 대해 반복
        dataArray.forEach((data) => {
            // 배열 내의 각 객체에 대해 반복
            data.forEach((item) => {
                const pc_name = item.pc_name;
                const keywordCounts = item.keywordCounts;
                // pc_name을 기준으로 keywordCounts를 병합
                if (mergedDataMap.has(pc_name)) {
                    const existingCounts = mergedDataMap.get(pc_name) || {};
                    Object.keys(keywordCounts).forEach((key) => {
                        existingCounts[key] =
                            (existingCounts[key] || 0) + keywordCounts[key];
                    });
                    mergedDataMap.set(pc_name, existingCounts);
                }
                else {
                    mergedDataMap.set(pc_name, Object.assign({}, keywordCounts));
                }
            });
        });
        // Map을 MergedData 객체의 배열로 변환
        const mergedDataArray = Array.from(mergedDataMap.entries()).map(([pc_name, keywordCounts]) => ({
            pc_name,
            keywordCounts,
            total: Object.values(keywordCounts).reduce((acc, count) => acc + count, 0), // total을 추가하고 값 계산
        }));
        // 합산된 값으로 내림차순 정렬
        const sortedMergedData = mergedDataArray.sort((a, b) => (b.total || 0) - (a.total || 0));
        // 상위 5개만 선택
        const top5MergedData = sortedMergedData.slice(0, 5);
        return top5MergedData;
    }
    if (outlookFlag !== undefined && outlookFlag === 'true') {
        Promise.all([
            fetchData("network"),
            fetchData("media"),
            fetchData("outlook"),
        ])
            .then((dataArray) => {
            const top5MergedData = mergeKeywordCounts(dataArray);
            res.status(200).send(top5MergedData);
        })
            .catch((err) => {
            console.error("에러 발생: ", err);
            res.status(500).send("Error fetching data");
        });
    }
    else {
        Promise.all([fetchData("network"), fetchData("media")])
            .then((dataArray) => {
            const top5MergedData = mergeKeywordCounts(dataArray);
            res.status(200).send(top5MergedData);
        })
            .catch((err) => {
            console.error("에러 발생: ", err);
            res.status(500).send("Error fetching data");
        });
    }
});
module.exports = router;
