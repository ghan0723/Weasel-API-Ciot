"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class UserService {
    //로그인 시 계정 정보 가져오기
    getLogin(username) {
        return new Promise((resolve, reject) => {
            const query = `SELECT username, password, privilege, enabled, fail_count FROM accountlist WHERE username = '${username}'`;
            db_1.default.query(query, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    removeUser(users) {
        // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
        const usernameString = users.map((username) => `'${username}'`).join(", ");
        // IN 절을 괄호로 감싸고 수정
        const query = `DELETE FROM accountlist WHERE username IN (${usernameString})`;
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
    getPrivilege(username) {
        const query = `select privilege from accountlist where username = '${username}'`;
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
    checkUsername(username, oldname) {
        return new Promise((resolve, reject) => {
            if (username !== oldname) {
                const query = "SELECT COUNT(*) as count FROM accountlist WHERE username = ?";
                db_1.default.query(query, [username], (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        const isDuplicate = result[0].count > 0;
                        if (isDuplicate) {
                            resolve({
                                exists: true,
                                message: "이미 사용 중인 계정명입니다.",
                            });
                        }
                        else {
                            resolve({ exists: false, message: "사용 가능한 계정명입니다." });
                        }
                    }
                });
            }
            else {
                resolve({ exists: false, message: "현재 계정명과 동일합니다." });
            }
        });
    }
    checkPwdFreq(username) {
        const query = `SELECT last_pwd_date, pwd_change_freq FROM accountlist WHERE username = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, [username], (error, result) => {
                if (error) {
                    reject(error.fatal);
                }
                else {
                    if (result.length > 0) {
                        const lastPwdDate = new Date(result[0].last_pwd_date);
                        const pwdChangeFreq = result[0].pwd_change_freq;
                        // 비밀번호 변경 주기를 날짜로 계산
                        const nextChangeDate = new Date(lastPwdDate);
                        const month = lastPwdDate.getMonth() + parseInt(pwdChangeFreq);
                        nextChangeDate.setMonth(month);
                        // 현재 날짜와 다음 변경 날짜를 비교
                        const currentDate = new Date();
                        if (currentDate > nextChangeDate) {
                            // 현재 날짜가 다음 변경 날짜를 넘었으면 true 반환
                            resolve(true);
                        }
                        else {
                            // 현재 날짜가 다음 변경 날짜를 넘지 않았으면 false 반환
                            resolve(false);
                        }
                    }
                    else {
                        // 해당 username의 레코드가 없는 경우도 처리할 수 있습니다.
                        reject("User not found");
                    }
                }
            });
        });
    }
    getPwdByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = "select password from accountlist where username = ?";
            db_1.default.query(query, [username], (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    modifyPwdByFreq(username, encPwd) {
        return new Promise((resolve, reject) => {
            const query = "update accountlist set password = ? , last_pwd_date = now() where username = ?";
            db_1.default.query(query, [encPwd, username], (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getFreq() {
        return new Promise((resolve, reject) => {
            const query = `select distinct(pwd_change_freq) as freq from accountlist;`;
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
    disabledUser(username, fail_count) {
        let query = "";
        if (fail_count >= 5) {
            query = `update accountlist set enabled = 0, fail_count = 0 where username = '${username}'`;
        }
        else {
            query = `update accountlist set fail_count = ${fail_count} where username = '${username}'`;
        }
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
    failCountDefault(username) {
        const query = `update accountlist set fail_count = 0 where username = '${username}'`;
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
    getUser(username) {
        const query = `select * from accountlist where username = '${username}'`;
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
    getUserList(privilege, category, searchWord) {
        let searchCondition = "";
        if (searchWord !== "" && category !== "") {
            //검색 조건이 존재한다.
            switch (category) {
                //카테고리가 사용자명일 때
                case "username":
                    searchCondition = `where username like '%${searchWord}%'`;
                    break;
                //카테고리가 등급일때
                case "privilege":
                    if (/(유저|유|저)/i.test(searchWord)) {
                        searchCondition = `where privilege = 2`;
                    }
                    else {
                        searchCondition = `where privilege = '${searchWord}`;
                    }
                    break;
                case "enabled":
                    if (/(비활성화|비|비활|비활성|비화|비활화)/i.test(searchWord)) {
                        searchCondition = `where enabled = 0`;
                    }
                    else if (/(활성화|활|활성|성화|활화|성|화)/i.test(searchWord)) {
                        searchCondition = `where enabled = 1`;
                    }
                    else {
                        searchCondition = `where enabled = '${searchWord}'`;
                    }
                    break;
            }
        }
        const query = `select username, privilege, enabled from accountlist where privilege > ${privilege}`;
        return new Promise((resolve, reject) => {
            const query2 = `select username, privilege, enabled from (${query}) as userTable ${searchCondition}`;
            db_1.default.query(query2, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let users = [];
                    for (const user of result) {
                        users.push({
                            username: user === null || user === void 0 ? void 0 : user.username,
                            privilege: user === null || user === void 0 ? void 0 : user.privilege,
                            enabled: user === null || user === void 0 ? void 0 : user.enabled
                        });
                    }
                    resolve(users);
                }
            });
        });
    }
    addUser(user) {
        const query = `insert into accountlist (username, password, privilege, enabled, last_pwd_date, pwd_change_freq)` +
            ` values ('${user.username}', '${user.password}', ${user.privilege}, 1, now(), ${user.freq})`;
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
    modifyUser(user, oldname) {
        let query = '';
        if (user.freq) {
            query = `update accountlist set username = '${user.username}', password = '${user.password}', privilege = ${user.privilege}, enabled = ${user.enabled}, last_pwd_date = now() where username = '${oldname}'`;
        }
        else {
            query = `update accountlist set username = '${user.username}', password = '${user.password}', privilege = ${user.privilege}, enabled = ${user.enabled} where username = '${oldname}'`;
        }
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
exports.default = UserService;
