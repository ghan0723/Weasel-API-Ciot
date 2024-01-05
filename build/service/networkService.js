"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NetworkService {
    constructor(connection) {
        this.connection = connection;
    }
    getCountAll() {
        return new Promise((resolve, reject) => {
            const query = "SELECT COUNT(*) as allfiles FROM detectfiles WHERE time LIKE '%2023-09-04%'";
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
}
exports.default = NetworkService;
