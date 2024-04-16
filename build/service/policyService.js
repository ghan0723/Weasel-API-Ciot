"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class PolicyService {
    getPolicyList() {
        const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (result) {
                    if (result.length === 0) {
                        result = [
                            {
                                name: " ",
                                distinction: " ",
                                author: " ",
                            },
                        ];
                    }
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    postTcUpload() {
        const query = ``;
        return new Promise((resolve, reject) => { });
    }
    getTestCases() {
        let query = `select * from testcases`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getTCByPName(name) {
        let query = `select * from tc_policy where p_name = ${name}`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getInsertSessions(username, policyname) {
        const query = `insert into sessions (username, p_name, s_name, s_time, s_response, s_log) values ('${username}', '${policyname}', now(), '', '{}', '{}');`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
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
exports.default = PolicyService;
