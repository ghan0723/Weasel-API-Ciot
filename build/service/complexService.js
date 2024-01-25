"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class ComplexService {
    getkData(props, select, ipRanges) {
        let table;
        let dayOption;
        let columns;
        if (props === "network") {
            table = "detectfiles";
            columns = "saved_file";
        }
        else if (props === "media") {
            table = "detectmediafiles";
            columns = "saved_file";
        }
        else if (props === "outlook") {
            table = "outlookpstviewer";
            columns = "saved_file";
        }
        else {
            table = "detectprinteddocuments";
            columns = "document";
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
        const query = `select pcname, agent_ip, ${columns} from ${table} where (${dayOption}) AND (${ipConditions}) order by time desc limit 5;`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    const keys = Array.from(new Set(result.flatMap((item) => Object.keys(item))));
                    resolve({
                        table: props,
                        data: result,
                        key: keys
                    });
                }
            });
        });
    }
}
exports.default = ComplexService;
