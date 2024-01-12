"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class PrintService {
    getCountAll(select) {
        let dayOption1;
        let dayOption2;
        if (select === "day") {
            dayOption1 = "CURDATE(), INTERVAL 0 DAY";
            dayOption2 = "CURDATE(), INTERVAL 1 DAY";
        }
        else if (select === "week") {
            dayOption1 = "CURDATE(), INTERVAL 1 WEEK";
            dayOption2 = "CURDATE(), INTERVAL 2 WEEK";
        }
        else {
            dayOption1 = "CURDATE(), INTERVAL 1 MONTH";
            dayOption2 = "CURDATE(), INTERVAL 2 MONTH";
        }
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as allprints FROM detectprinteddocuments WHERE time >= DATE_SUB(${dayOption1})`;
            const query3 = `SELECT COUNT(*) as beforeprints FROM detectprinteddocuments WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1})`;
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].allprints;
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
                            this.query2 = result[0].beforeprints;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    allprints: this.query1,
                    beforeprints: this.query2 !== 0
                        ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                        : ((this.query1 / 1) * 100).toFixed(2),
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getApiData() {
        return new Promise((resolve, reject) => {
            const query = 'select id, `time` as Time, pcname , agent_ip , process , pid as PIDs, printer as Printers, ' +
                'owner as Owners, document as Documents, ' +
                'spl_file as Copied_Spool_Files, spl_file as Downloading, ' +
                '`size` as Sizes, pages as Pages ' +
                'from detectprinteddocuments ' +
                'order by `time` desc;';
            const query2 = 'select count(*) as count from detectprinteddocuments;';
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query2, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(values => {
                console.log("values : ", values);
                resolve(values);
            })
                .catch(error => reject(error));
        });
    }
}
exports.default = PrintService;
