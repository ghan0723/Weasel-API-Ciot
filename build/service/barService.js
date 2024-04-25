"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class BarService {
    getBarData(props, param, ipRanges) {
        let table;
        let dayOption;
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
        if (param === "day") {
            dayOption = "DATE(time) = CURDATE()";
        }
        else if (param === "week") {
            dayOption =
                "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
        }
        else {
            dayOption =
                "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        let query = `select latest_agent_ip, count(distinct id) as totalCount from ${table} where (${dayOption}) AND (${ipConditions}) group by latest_agent_ip order by totalCount desc limit 5`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    // 가공된 데이터 생성
                    const data = result.map((item) => ({
                        agentip: item.latest_agent_ip,
                        totalCount: item.totalCount,
                    }));
                    // 최종 결과물 반환
                    resolve({
                        table: props,
                        data: data,
                    });
                }
            });
        });
    }
}
exports.default = BarService;
