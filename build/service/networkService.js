"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NetworkService {
    constructor(connection) {
        this.connection = connection;
    }
    getCountAll(select) {
        let dayOption1;
        let dayOption2;
        if (select === 'day') {
            dayOption1 = 'CURDATE(), INTERVAL 0 DAY';
            dayOption2 = 'CURDATE(), INTERVAL 1 DAY';
        }
        else if (select === 'week') {
            dayOption1 = 'CURDATE(), INTERVAL 1 WEEK';
            dayOption2 = 'CURDATE(), INTERVAL 2 WEEK';
        }
        else {
            dayOption1 = 'CURDATE(), INTERVAL 1 MONTH';
            dayOption2 = 'CURDATE(), INTERVAL 2 MONTH';
        }
        return new Promise((resolve, reject) => {
            const query3 = `SELECT COUNT(*) as allfiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption1})`;
            const query4 = `SELECT COUNT(*) as beforefiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1})`;
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query3, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].allfiles;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    this.connection.query(query4, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query2 = result[0].beforefiles;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    allfiles: this.query1,
                    beforefiles: (this.query2 !== 0) ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2) : (this.query1 / 1 * 100).toFixed(2),
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getApiData() {
        return new Promise((resolve, reject) => {
            const query = 'select * from detectfiles';
            this.connection.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    ;
}
exports.default = NetworkService;
