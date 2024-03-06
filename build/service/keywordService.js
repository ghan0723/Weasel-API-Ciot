"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class KeywordService {
    getKeyword(props, select, ipRanges, keywordList) {
        let table;
        let dayOption;
        let keywordOption = "";
        if (props === "network") {
            table = "leakednetworkfiles";
        }
        else if (props === "media") {
            table = "leakedmediafiles";
        }
        else if (props === "outlook") {
            table = "leakedoutlookfiles";
        }
        else {
            table = "leakedprintingfiles";
        }
        if (select === "day") {
            dayOption = "DATE(time) = CURDATE()";
        }
        else if (select === "week") {
            dayOption = "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
        }
        else {
            dayOption = "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        if (keywordList.length > 0) {
            keywordOption = `AND ( ${keywordList
                .map((keyword) => `patterns LIKE '%${keyword}%'`)
                .join(" OR ")} )`;
        }
        const query = `select pc_name, patterns from ${table} where (${dayOption}) AND (${ipConditions}) ${keywordOption} `;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    const pc_names = Array.from(new Set(result.map((item) => item.pc_name)));
                    const resultWithCounts = pc_names.map((pc_name) => {
                        const pcResults = result.filter((item) => item.pc_name === pc_name);
                        // Create an object to store keyword counts for the current pc_name
                        const keywordCountMap = {};
                        pcResults.forEach((item) => {
                            // Extract counts and patterns using regex
                            const matches = item.patterns.match(/([^\s:,]+):(\d+)/g);
                            if (matches) {
                                matches.forEach((match) => {
                                    const [keyword, count] = match.split(":");
                                    const numericCount = parseInt(count, 10) || 1;
                                    // Add the count to the existing count for the keyword
                                    if (keywordList.includes(keyword)) {
                                        keywordCountMap[keyword] =
                                            (keywordCountMap[keyword] || 0) + numericCount;
                                    }
                                });
                            }
                        });
                        // Return an object with pc_name and keyword counts
                        return {
                            pc_name: pc_name,
                            keywordCounts: keywordCountMap,
                        };
                    });
                    // Merge results for duplicate pc_names
                    const mergedResult = [];
                    resultWithCounts.forEach((item) => {
                        const existingIndex = mergedResult.findIndex((mergedItem) => mergedItem.pc_name === item.pc_name);
                        if (existingIndex !== -1) {
                            // Merge keyword counts for duplicate pc_names
                            Object.entries(item.keywordCounts).forEach(([keyword, count]) => {
                                mergedResult[existingIndex].keywordCounts[keyword] =
                                    (mergedResult[existingIndex].keywordCounts[keyword] || 0) +
                                        count;
                            });
                        }
                        else {
                            // Add unique pc_name to the merged result
                            mergedResult.push(item);
                        }
                    });
                    resolve(mergedResult);
                }
            });
        });
    }
    getKeywordList() {
        return new Promise((resolve, reject) => {
            const query = `select clnt_patterns_list from serversetting;`;
            db_1.default.query(query, (error, result) => {
                var _a;
                if (error) {
                    reject(error);
                }
                else {
                    // 패턴: = 문자로 시작하고 @@으로 끝나는 모든 항목을 찾음
                    // ([^=]+)는 '=' 기호 전까지의 모든 문자를 키로 매칭하며, ([^&]+)는 '&' 기호 전까지의 모든 문자를 값으로 매칭합니다.
                    // '@@'는 각 키-값 쌍의 끝을 나타냅니다.
                    const regex = /([^=]+)=([^@]+)@@/g;
                    let matches;
                    const results = [];
                    while ((matches = regex.exec((_a = result[0]) === null || _a === void 0 ? void 0 : _a.clnt_patterns_list)) !== null) {
                        // matches[1]은 키, matches[2]는 값
                        results.push({
                            key: matches[1], // 키
                            // value: matches[2] // 값
                        });
                    }
                    const keysResult = results.map((data) => data.key);
                    resolve(keysResult);
                }
            });
        });
    }
}
exports.default = KeywordService;
