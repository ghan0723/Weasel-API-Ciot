"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class OutlookService {
    getCountAll() {
        return new Promise((resolve, reject) => {
            const query = "select count(*) as alloutlooks from outlookpstviewer where time Like CONCAT('%', CURDATE(), '%')";
            const query3 = "select count(*) as beforeoutlooks from outlookpstviewer where time LIKE CONCAT('%', (CURDATE()- INTERVAL 1 DAY), '%')";
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].alloutlooks;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query3, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query2 = result[0].beforeoutlooks;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    alloutlooks: this.query1,
                    beforeoutlooks: (this.query1 / this.query2) * 100 || 0,
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
}
exports.default = OutlookService;
