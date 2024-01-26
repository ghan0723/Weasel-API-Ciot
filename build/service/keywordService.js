"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class KeywordService {
    getKeyword(props, select, ipRanges) {
        let table;
        let dayOption;
        if (props === "network") {
            table = "detectfiles";
        }
        else if (props === "media") {
            table = "detectmediafiles";
        }
        else if (props === "outlook") {
            table = "outlookpstviewer";
        }
        else {
            table = "detectprinteddocuments";
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
            .map((range) => `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        const query = `select pcname, keywords from ${table} where (${dayOption}) AND (${ipConditions}) AND 
    (
      keywords LIKE '%주민번호%' OR
      keywords LIKE '%핸드폰번호%' OR
      keywords LIKE '%이력서%'
    ) `;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    const pcnames = Array.from(new Set(result.map((item) => item.pcname)));
                    const resultWithCounts = pcnames.map((pcname) => {
                        const pcResults = result.filter((item) => item.pcname === pcname);
                        // Create an object to store keyword counts for the current pcname
                        const keywordCountMap = {};
                        pcResults.forEach((item) => {
                            // Extract counts and keywords using regex
                            const matches = item.keywords.match(/([^\s,()]+)(?:\s*,\s*|\s*\(\s*(\d+)\s*\)\s*)?/g);
                            if (matches) {
                                matches.forEach((match) => {
                                    const [keyword, count] = match.split(/\s*\(\s*|\s*\)\s*/);
                                    const numericCount = parseInt(count, 10) || 1;
                                    // Add the count to the existing count for the keyword
                                    keywordCountMap[keyword] =
                                        (keywordCountMap[keyword] || 0) + numericCount;
                                });
                            }
                        });
                        // Return an object with pcname and keyword counts
                        return {
                            pcname: pcname,
                            keywordCounts: keywordCountMap,
                        };
                    });
                    // Merge results for duplicate pcnames
                    const mergedResult = [];
                    resultWithCounts.forEach((item) => {
                        const existingIndex = mergedResult.findIndex((mergedItem) => mergedItem.pcname === item.pcname);
                        if (existingIndex !== -1) {
                            // Merge keyword counts for duplicate pcnames
                            Object.entries(item.keywordCounts).forEach(([keyword, count]) => {
                                mergedResult[existingIndex].keywordCounts[keyword] =
                                    (mergedResult[existingIndex].keywordCounts[keyword] || 0) +
                                        count;
                            });
                        }
                        else {
                            // Add unique pcname to the merged result
                            mergedResult.push(item);
                        }
                    });
                    resolve(mergedResult);
                }
            });
        });
    }
}
exports.default = KeywordService;
