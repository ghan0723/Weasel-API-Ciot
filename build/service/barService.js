"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class BarService {
    getBarData(props, param) {
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
        if (param === 'day') {
            dayOption = 'DATE(time) = CURDATE()';
        }
        else if (param === 'week') {
            dayOption = 'time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND time < CURDATE()';
        }
        else {
            dayOption = 'time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND time < CURDATE()';
        }
        let query = `select agent_ip, count(distinct id) as totalCount from ${table} where ${dayOption} group by agent_ip order by totalCount desc limit 10`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    // 가공된 데이터 생성
                    const data = result.map((item) => ({
                        agentip: item.agent_ip,
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
