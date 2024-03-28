"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class PieChartService {
    getPieDataToday(id, day, ipRanges) {
        //매개변수를 Table 명을 정하는 값으로 받을꺼임
        let table;
        let dayOption;
        if (id === 'Network') {
            table = 'leakednetworkfiles';
        }
        else if (id === 'Media') {
            table = 'leakedmediafiles';
        }
        else if (id === 'Outlook') {
            table = 'leakedoutlookfiles';
        }
        else {
            table = 'leakedprintingfiles';
        }
        if (day === 'day') {
            dayOption = 'DATE(time) = CURDATE()';
        }
        else if (day === 'week') {
            dayOption = 'time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time < NOW()';
        }
        else {
            dayOption = 'time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time < NOW()';
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        let queryNet1 = `select proc_name, count(proc_name) as count from ${table} where ${dayOption} AND (${ipConditions}) group by proc_name order by count(proc_name) desc limit 4`;
        let queryNet2 = `select count(*) as totalCount from ${table} where ${dayOption} AND (${ipConditions})`;
        return new Promise((resolve, reject) => {
            db_1.default.query(queryNet1, (error, result1) => {
                if (error) {
                    reject(error);
                }
                else {
                    db_1.default.query(queryNet2, (error2, result2) => {
                        if (error2) {
                            reject(error2);
                        }
                        const data = result1.map((item) => {
                            const count = (item.count / result2[0].totalCount) * 100;
                            return {
                                proc_name: item.proc_name,
                                count: item.count,
                                hcount: parseFloat(count.toFixed(1))
                            };
                        });
                        data.sort((a, b) => b.count - a.count);
                        resolve(data);
                    });
                }
            });
        });
    }
}
exports.default = PieChartService;
