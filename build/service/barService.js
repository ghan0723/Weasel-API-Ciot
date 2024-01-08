"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class BarService {
    getBarData(props) {
        let table;
        if (props === 'network') {
            table = 'detectfiles';
        }
        else if (props === 'media') {
            table = 'detectmediafiles';
        }
        else if (props === 'outlook') {
            table = 'outlookpstviewer';
        }
        else {
            table = 'detectprinteddocuments';
        }
        let query = `select agent_ip, count(distinct id) as totalCount from ${table} 
        where DATE(time) = CURDATE() group by agent_ip order by totalCount desc limit 10`;
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
                    console.log("bar data : ", data);
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
