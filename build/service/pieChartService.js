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
            table = 'detectfiles';
        }
        else if (id === 'Media') {
            table = 'detectmediafiles';
        }
        else if (id === 'Outlook') {
            table = 'outlookpstviewer';
        }
        else {
            table = 'detectprinteddocuments';
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
            .map((range) => `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        let queryNet1 = `select process, count(process) as count from ${table} where ${dayOption} AND (${ipConditions}) group by process`;
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
                            // console.log("hcount : ", count);
                            return {
                                process: item.process,
                                count: item.count,
                                hcount: Math.floor(count),
                                day: Date.now(),
                            };
                        });
                        data.sort((a, b) => b.count - a.count);
                        // console.log("data : ", data);
                        resolve(data);
                    });
                }
            });
        });
    }
}
exports.default = PieChartService;
