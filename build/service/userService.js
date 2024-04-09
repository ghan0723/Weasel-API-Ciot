"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const ipCalcService_1 = __importDefault(require("./ipCalcService"));
class UserService {
    getLogin(username) {
        return new Promise((resolve, reject) => {
            const query = `SELECT username, passwd, privilege, ip_ranges, enabled, fail_count FROM accountlist WHERE username = '${username}'`;
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
    getUserList(privilege) {
        return new Promise((resolve, reject) => {
            const query = `select username, privilege, enabled, ip_ranges from accountlist where privilege > ${privilege}`;
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
    addUser(user, freq) {
        let mngip = user.ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
        let privilege = parseInt(user.privilege, 10);
        let query = '';
        if (freq !== undefined && freq !== null) {
            query = `insert into accountlist (\`username\`, \`passwd\`, \`privilege\`, \`enabled\`, \`ip_ranges\`, \`last_pwd_date\`, \`pwd_change_freq\`) values ('${user.username}', '${user.passwd}', ${privilege}, 1, '${mngip}', now(), ${freq})`;
        }
        else {
            query = `insert into accountlist (\`username\`, \`passwd\`, \`privilege\`, \`enabled\`, \`ip_ranges\`, \`last_pwd_date\`, \`pwd_change_freq\`) values ('${user.username}', '${user.passwd}', ${privilege}, 1, '${mngip}', now(), 1)`;
        }
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ success: true, message: "회원 가입 성공" });
                }
            });
        }));
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
    getUser(username) {
        const query = `select username, passwd, privilege, ip_ranges, enabled from accountlist where username = ? `;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    modUser(user, oldname, enabled) {
        let mngip = user.ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
        let privilege = parseInt(user.privilege, 10);
        let query = "";
        if (!enabled) {
            query = `UPDATE accountlist SET username = '${user.username}', passwd = '${user.passwd}', privilege = ${privilege}, ip_ranges = '${mngip}' WHERE username = '${oldname}'`;
        }
        else {
            query = `UPDATE accountlist SET username = '${user.username}', passwd = '${user.passwd}', privilege = ${privilege}, ip_ranges = '${mngip}', enabled = ${enabled} WHERE username = '${oldname}'`;
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
    getPrivilege(username) {
        const query = `select privilege from accountlist where username = ? `;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getPrivilegeAndIP(username) {
        const query = `select privilege, ip_ranges from accountlist where username = ? `;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getUserListByPrivilegeAndIP(privilege, ipRanges, category, searchWord) {
        let searchCondition = "";
        if (searchWord !== "" && category !== "") {
            // 여기에서 category에 따라 적절한 검색 조건을 추가합니다.
            switch (category) {
                case "username":
                    searchCondition = `where username LIKE '%${searchWord}%'`;
                    break;
                // 다른 카테고리에 대한 추가적인 case문을 필요에 따라 추가한다.
                case "privilege":
                    if (/(영역별\s*관리자|영역|영|역|별|관|리|자|관리|관리자|리자|자|리|다)/i.test(searchWord)) {
                        searchCondition = "where privilege = 2";
                    }
                    else if (/(모니터|모|모니|니|니터|터|모터)/i.test(searchWord)) {
                        searchCondition = `where privilege = 3`;
                    }
                    else {
                        searchCondition = `where privilege = '${searchWord}'`;
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
                case "ip_ranges":
                    searchCondition = `where ip_ranges LIKE '%${searchWord}%'`;
                default:
                    break;
            }
        }
        // // IP 범위 조건들을 생성
        // const ipConditions = ipRanges
        //   .map(
        //     (range) =>
        //       `(INET_ATON(ip_ranges) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
        //   )
        //   .join(" OR ");
        // SQL 쿼리 생성
        const query = `
        SELECT username, privilege, enabled, ip_ranges FROM accountlist WHERE privilege > ${privilege} `;
        //   AND (${ipConditions}) 
        // `;
        return new Promise((resolve, reject) => {
            const query2 = `select username, privilege, enabled, ip_ranges from (${query}) AS userTable ${searchCondition}`;
            // 쿼리 실행
            db_1.default.query(query2, (error, result) => { var _a, result_1, result_1_1; return __awaiter(this, void 0, void 0, function* () {
                var _b, e_1, _c, _d;
                if (error) {
                    reject(error);
                }
                else {
                    let users = [];
                    try {
                        for (_a = true, result_1 = __asyncValues(result); result_1_1 = yield result_1.next(), _b = result_1_1.done, !_b; _a = true) {
                            _d = result_1_1.value;
                            _a = false;
                            const user = _d;
                            const selectRanges = ipCalcService_1.default.parseIPRange(user.ip_ranges);
                            const inRange = yield UserService.checkIpRange(selectRanges, ipRanges);
                            if (inRange.inRange) {
                                users.push(user);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_a && !_b && (_c = result_1.return)) yield _c.call(result_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    if (privilege !== 3) {
                        resolve(users);
                    }
                    else {
                        reject("error");
                    }
                }
            }); });
        });
    }
    getUserListAll(category, searchWord, id, ipRanges) {
        let searchCondition = "";
        if (id !== 1) {
            searchCondition = "privilege > 1";
        }
        else {
            searchCondition = "privilege >= 1";
        }
        if (searchWord !== "" && category !== "") {
            // 여기에서 category에 따라 적절한 검색 조건을 추가합니다.
            switch (category) {
                case "username":
                    searchCondition += ` AND username LIKE '%${searchWord}%'`;
                    break;
                // 다른 카테고리에 대한 추가적인 case문을 필요에 따라 추가한다.
                case "privilege":
                    if (/(영역별\s*관리자|영역|영|역|별|관|리|자|관리|관리자|리자|자|리|다)/i.test(searchWord)) {
                        searchCondition += " AND privilege = 2";
                    }
                    else if (/(모니터|모|모니|니|니터|터|모터)/i.test(searchWord)) {
                        searchCondition += ` AND privilege = 3`;
                    }
                    else {
                        searchCondition += ` AND privilege = '${searchWord}'`;
                    }
                    break;
                case "enabled":
                    if (/(비활성화|비|비활|비활성|비화|비활화)/i.test(searchWord)) {
                        searchCondition += ` AND enabled = 0`;
                    }
                    else if (/(활성화|활|활성|성화|활화|성|화)/i.test(searchWord)) {
                        searchCondition += ` AND enabled = 1`;
                    }
                    else {
                        searchCondition += ` AND enabled LIKE '%${searchWord}%'`;
                    }
                    break;
                case "ip_ranges":
                    searchCondition += ` AND ip_ranges LIKE '%${searchWord}%'`;
                default:
                    break;
            }
        }
        // id가 1인 경우에만 검색 조건에 추가합니다.
        if (id === 1) {
            searchCondition += " AND id != 1";
        }
        return new Promise((resolve, reject) => {
            const query = `select username, privilege, enabled, ip_ranges from accountlist where ${searchCondition}`;
            db_1.default.query(query, (error, result) => { var _a, result_2, result_2_1; return __awaiter(this, void 0, void 0, function* () {
                var _b, e_2, _c, _d;
                if (error) {
                    reject(error);
                }
                else {
                    let users = [];
                    try {
                        for (_a = true, result_2 = __asyncValues(result); result_2_1 = yield result_2.next(), _b = result_2_1.done, !_b; _a = true) {
                            _d = result_2_1.value;
                            _a = false;
                            const user = _d;
                            const selectRanges = ipCalcService_1.default.parseIPRange(user.ip_ranges);
                            const inRange = yield UserService.checkIpRange(selectRanges, ipRanges);
                            if (inRange.inRange) {
                                users.push(user);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_a && !_b && (_c = result_2.return)) yield _c.call(result_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    resolve(users);
                }
            }); });
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
    // mng_ip : 변경할 user의 range
    // ipRanges : 로그인 한 user의 range
    static checkIpRange(mng_ip, ipRanges) {
        return new Promise((resolve, reject) => {
            let isInRange = false;
            for (const range of mng_ip) {
                const ipStartCheck = this.ipToNumber(range.start);
                const ipEndCheck = this.ipToNumber(range.end);
                // 현재 범위가 하나라도 허용된 범위에 속하는지 확인
                if (ipRanges.some((cooRange) => ipStartCheck >= this.ipToNumber(cooRange.start) && ipEndCheck <= this.ipToNumber(cooRange.end))) {
                    isInRange = true;
                    break; // 하나라도 속하면 검사 종료
                }
                else if (ipRanges.some((cooRange) => range.start >= cooRange.start && range.end <= cooRange.end)) {
                    isInRange = true;
                    break; // 하나라도 속하면 검사 종료
                }
                else {
                }
            }
            if (isInRange) {
                resolve({
                    inRange: true,
                    message: "IP 주소가 허용된 범위 내에 있습니다.",
                });
            }
            else {
                resolve({
                    inRange: false,
                    message: "IP 주소가 허용된 범위에 속하지 않습니다.",
                });
            }
        });
    }
    static ipToNumber(ip) {
        if (typeof ip === "string" && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
            const ipParts = ip.split(".").map(Number);
            if (ipParts.length === 4 &&
                ipParts.every((part) => part >= 0 && part <= 255)) {
                return ((ipParts[0] << 24) |
                    (ipParts[1] << 16) |
                    (ipParts[2] << 8) |
                    ipParts[3]);
            }
            else {
                return ({ error: '올바르지 않은 IP 주소 형식입니다.' });
            }
        }
        else {
            return ({ error: '올바르지 않은 IP 형식입니다.' });
        }
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
            const query = "select passwd from accountlist where username = ?";
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
            const query = "update accountlist set passwd = ? , last_pwd_date = now() where username = ?";
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
            const query = `select distinct(pwd_change_freq) from accountlist;`;
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
    getPopupNotice() {
        return new Promise((resolve, reject) => {
            const query = `select count(description) as count, description from popupnotice`;
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
    getIdAndPriAndIp(username) {
        const query = `select id, privilege, ip_ranges from accountlist where username = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    signUp(user) {
        let mngip = user.ip_ranges.replace(/(\r\n|\n|\r)/gm, ", ");
        let query = `insert into accountlist (\`username\`, \`passwd\`, \`privilege\`, \`enabled\`, \`ip_ranges\`, \`last_pwd_date\`, \`pwd_change_freq\`) values ('${user.username}', '${user.passwd}', ${user.privilege}, 1, '${mngip}', now(), ${user.freq})`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ success: true, message: "회원 가입 성공" });
                }
            });
        });
    }
}
exports.default = UserService;
