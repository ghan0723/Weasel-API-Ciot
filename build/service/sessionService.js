"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class SessionService {
    getSessionList(category, searchWord) {
        let searchCondition = "";
        if (searchWord !== "" && category !== "") {
            switch (category) {
                //카테고리가 번호일 때
                case "s_id":
                    searchCondition = `where s_id like '%${searchWord}%'`;
                    break;
                //카테고리가 사용자명일 때
                case "username":
                    searchCondition = `where username like '%${searchWord}%'`;
                    break;
                //카테고리가 점검 정책명일 때
                case "p_name":
                    searchCondition = `where p_name like '%${searchWord}%'`;
                    break;
                //카테고리가 세션명일 때
                case "s_name":
                    searchCondition = `where s_name like '%${searchWord}%'`;
                    break;
                case "s_time":
                    searchCondition = `where p_name like '%${searchWord}%'`;
                    break;
            }
        }
        const query = `select * from sessions ${searchCondition}`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let sessions = [];
                    for (const session of result) {
                        sessions.push({
                            s_id: session === null || session === void 0 ? void 0 : session.s_id,
                            s_name: session === null || session === void 0 ? void 0 : session.s_name,
                            p_name: session === null || session === void 0 ? void 0 : session.p_name,
                            username: session === null || session === void 0 ? void 0 : session.username,
                            s_time: session === null || session === void 0 ? void 0 : session.s_time,
                        });
                    }
                    resolve(sessions);
                }
            });
        });
    }
}
exports.default = SessionService;
