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
    getUserList(grade) {
        return new Promise((resolve, reject) => {
            const query = `select username, grade, enabled, mng_ip_ranges from userlist where grade > ${grade}`;
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
    addUser(user) {
        return new Promise((resolve, reject) => {
            const query = `insert into userlist (?)`;
        });
    }
}
exports.default = UserService;
