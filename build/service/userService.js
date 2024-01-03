"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserService {
    constructor(connection) {
        this.connection = connection;
    }
    getUser(username, passwd) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT username, grade, enabled, mng_ip_ranges FROM userlist WHERE username = ? AND passwd = ?';
            this.connection.query(query, [username, passwd], (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
}
exports.default = UserService;
