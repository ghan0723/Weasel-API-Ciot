"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class AnalysisService {
    settingDateAndRange(startDate, endDate) {
        const tables = ['leakednetworkfiles', 'leakedmediafiles', 'leakedoutlookfiles', 'leakedprintingfiles'];
        // startDate와 endDate가 주어졌는지 확인
        if (!startDate || !endDate) {
            throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
        }
        const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;
        const promises = tables.map(data => {
            return new Promise((innerResolve, innerReject) => {
                const query = `select * from ${data} where (${dayOption})`;
                db_1.default.query(query, (error, result) => {
                    if (error) {
                        innerReject(error);
                    }
                    else {
                        innerResolve(result);
                    }
                });
            });
        });
        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then((values) => {
                resolve(values);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
}
exports.default = AnalysisService;
