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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class LeakedService {
    getApiData(page, pageSize, sorting, desc, category, search, ipRanges, excelCheck) {
        let queryPage = 0;
        let queryPageSize = 0;
        let querySorting = sorting === "" ? "time" : sorting;
        let queryDesc = desc === "false" ? "asc" : "desc";
        let whereClause = "";
        if (page !== undefined) {
            queryPage = Number(page);
        }
        if (pageSize !== undefined) {
            queryPageSize = Number(pageSize);
        }
        if (sorting === "" && desc === "") {
            sorting = "time";
            desc = "desc";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges.map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`).join(" OR ");
        if (search !== "") {
            whereClause = `where ${category} like ? AND (${ipConditions})`;
        }
        else {
            whereClause = `where ${ipConditions}`;
        }
        return new Promise((resolve, reject) => {
            let query = "";
            if (!excelCheck) {
                query =
                    "select pc_guid, pc_name, latest_agent_ip, time, agent_name, agent_department " +
                        // "select * " +
                        "from agentinfo " +
                        whereClause +
                        " order by " +
                        querySorting +
                        " " +
                        queryDesc +
                        " " +
                        "LIMIT " +
                        queryPageSize +
                        " offset " +
                        queryPage * queryPageSize;
            }
            else {
                query =
                    "select pc_guid, pc_name, latest_agent_ip, time, agent_name, agent_department " +
                        // "select * " +
                        "from agentinfo " +
                        whereClause +
                        " order by " +
                        querySorting +
                        " " +
                        queryDesc +
                        " ";
            }
            const query2 = "select count(*) as count from agentinfo " + whereClause;
            const whereQuery = "%" + search + "%";
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, whereQuery, (error, result) => {
                        // 검색 결과가 없을 경우의 처리
                        if (result.length === 0) {
                            result[0] = { pc_guid: "", pc_name: "", latest_agent_ip: "", time: "", agent_name: "", agent_department: "" };
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            if (excelCheck) {
                                for (let i = 0; i < result.length; i++) {
                                    result[i]['PC GUID'] = result[i]['pc_guid'];
                                    delete result[i].pc_guid;
                                    result[i]['PC명'] = result[i]['pc_name'];
                                    delete result[i].pc_name;
                                    result[i]['AGENT IP'] = result[i]['latest_agent_ip'];
                                    delete result[i].latest_agent_ip;
                                    result[i]['업데이트 시각'] = result[i]['time'];
                                    delete result[i].time;
                                    result[i]['PC 사용자 명'] = result[i]['agent_name'];
                                    delete result[i].agent_name;
                                    result[i]['PC 사용자 부서 명'] = result[i]['agent_department'];
                                    delete result[i].agent_department;
                                }
                            }
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query2, whereQuery, (error, result) => {
                        if (result[0].count === 0) {
                            result[0].count = 1;
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then((values) => {
                resolve(values);
            })
                .catch((error) => {
                return reject(error);
            });
        });
    }
    // DummyData 생성
    getDummyData(count) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            let queryDay;
            let queryMonth;
            let queryDayStr;
            let queryMonthStr;
            let queryYearStr;
            let agentIp;
            for (let i = 0; i < count; i++) {
                if (i % 3 === 0) {
                    agentIp = "10.10.10.157";
                }
                else if (i % 3 === 1) {
                    agentIp = "192.168.1.55";
                }
                else {
                    agentIp = "10.10.10.127";
                }
                // 날짜 계산
                date.setDate(date.getDate() - 1);
                if (date.getDate() === 0)
                    date.setDate(0);
                queryDay = date.getDate();
                queryMonth = date.getMonth() + 1;
                queryYearStr = date.getFullYear().toString();
                if (queryDay < 10) {
                    queryDayStr = "0" + queryDay;
                }
                else {
                    queryDayStr = queryDay.toString();
                }
                if (queryMonth < 10) {
                    queryMonthStr = "0" + queryMonth;
                }
                else {
                    queryMonthStr = queryMonth.toString();
                }
                const query = `insert into	agentinfo (
        pc_guid,
        pc_name,
        latest_agent_ip,
        time)
    values (
    'PCGUID${i + 1}',
    now(),
    'PCname${i + 1}',
    '${agentIp}');`;
                try {
                    const result = yield new Promise((resolve, reject) => {
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
                catch (error) {
                }
            }
        });
    }
    //modify leaked agent data
    modLeakedAgent(columnId, value, pc_guid) {
        //전달 받은 내용이 PC 사용자명이냐 PC 사용자 부서명이냐에 따라서 query 변경
        let query = ``;
        if (columnId === 'agent_name') {
            query = `update agentinfo set agent_name = '${value}' where pc_guid = '${pc_guid}' `;
        }
        else if (columnId === 'agent_department') {
            query = `update agentinfo set agent_department = '${value}' where pc_guid = '${pc_guid}' `;
        }
        else {
            //이건 columnId가 안 넘어온 경우
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
exports.default = LeakedService;
