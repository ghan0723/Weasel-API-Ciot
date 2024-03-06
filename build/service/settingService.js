"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const fs_1 = __importDefault(require("fs"));
class SettingService {
    addAgentSetting() {
        return new Promise((resolve, reject) => {
            db_1.default;
        });
    }
    modAgentSetting(agent) {
        var _a, _b;
        let excip = (_a = agent.exceptionList) === null || _a === void 0 ? void 0 : _a.replace(/(\r\n|\n|\r)/gm, ", ");
        let kewordRef = (_b = agent.keywordList) === null || _b === void 0 ? void 0 : _b.replace(/(\r\n|\n|\r)/gm, "@@");
        // db에 undefined가 문자열로 들어가는 것을 막기위한 예외처리
        if (excip === undefined)
            excip = '';
        if (kewordRef === undefined)
            kewordRef = '';
        const query = `update serversetting set uid=${agent.uid}, clnt_svr_ip="${agent.serverIP}", clnt_svr_port=${agent.serverPort}, clnt_svr_conn_interval=${agent.serverInterval}, 
    clnt_license="${agent.licenseDist}", clnt_exceptions_list="${excip}", clnt_patterns_list="${kewordRef}", svr_checkbox_flag=${agent.flag}`;
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
    getAgentSetting() {
        const query = "select uid, svr_checkbox_flag, clnt_svr_ip, clnt_svr_port, clnt_svr_conn_interval, clnt_license, clnt_exceptions_list, clnt_patterns_list, svr_port, svr_file_retention_periods, svr_auto_fileupload from serversetting";
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
                if (error) {
                    reject(error);
                }
                else {
                    const clntKeywordList = (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.clnt_patterns_list) !== null && _b !== void 0 ? _b : '';
                    const clntExceptionList = (_d = (_c = result[0]) === null || _c === void 0 ? void 0 : _c.clnt_exceptions_list) !== null && _d !== void 0 ? _d : '';
                    if (clntKeywordList && clntKeywordList.includes("@@")) {
                        const modifiedKeywordList = clntKeywordList.replace(/@@/g, "\n");
                        if (clntExceptionList) {
                            const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
                            resolve([
                                {
                                    uid: (_e = result[0]) === null || _e === void 0 ? void 0 : _e.uid,
                                    svr_checkbox_flag: (_f = result[0]) === null || _f === void 0 ? void 0 : _f.svr_checkbox_flag,
                                    clnt_svr_ip: (_g = result[0]) === null || _g === void 0 ? void 0 : _g.clnt_svr_ip,
                                    clnt_svr_port: (_h = result[0]) === null || _h === void 0 ? void 0 : _h.clnt_svr_port,
                                    clnt_svr_conn_interval: (_j = result[0]) === null || _j === void 0 ? void 0 : _j.clnt_svr_conn_interval,
                                    clnt_license: (_k = result[0]) === null || _k === void 0 ? void 0 : _k.clnt_license,
                                    clnt_exceptions_list: modifiedExcepIP,
                                    clnt_patterns_list: modifiedKeywordList,
                                    svr_port: (_l = result[0]) === null || _l === void 0 ? void 0 : _l.svr_port,
                                    svr_file_retention_periods: (_m = result[0]) === null || _m === void 0 ? void 0 : _m.svr_file_retention_periods,
                                    svr_auto_fileupload: (_o = result[0]) === null || _o === void 0 ? void 0 : _o.svr_auto_fileupload,
                                },
                            ]);
                        }
                        else {
                            resolve([
                                {
                                    uid: (_p = result[0]) === null || _p === void 0 ? void 0 : _p.uid,
                                    svr_checkbox_flag: (_q = result[0]) === null || _q === void 0 ? void 0 : _q.svr_checkbox_flag,
                                    clnt_svr_ip: (_r = result[0]) === null || _r === void 0 ? void 0 : _r.clnt_svr_ip,
                                    clnt_svr_port: (_s = result[0]) === null || _s === void 0 ? void 0 : _s.clnt_svr_port,
                                    clnt_svr_conn_interval: (_t = result[0]) === null || _t === void 0 ? void 0 : _t.clnt_svr_conn_interval,
                                    clnt_license: (_u = result[0]) === null || _u === void 0 ? void 0 : _u.clnt_license,
                                    clnt_exceptions_list: (_v = result[0]) === null || _v === void 0 ? void 0 : _v.clnt_exceptions_list,
                                    clnt_patterns_list: modifiedKeywordList,
                                    svr_port: (_w = result[0]) === null || _w === void 0 ? void 0 : _w.svr_port,
                                    svr_file_retention_periods: (_x = result[0]) === null || _x === void 0 ? void 0 : _x.svr_file_retention_periods,
                                    svr_auto_fileupload: (_y = result[0]) === null || _y === void 0 ? void 0 : _y.svr_auto_fileupload,
                                },
                            ]);
                        }
                    }
                    else {
                        if (clntExceptionList) {
                            const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
                            resolve([
                                {
                                    uid: (_z = result[0]) === null || _z === void 0 ? void 0 : _z.uid,
                                    svr_checkbox_flag: (_0 = result[0]) === null || _0 === void 0 ? void 0 : _0.svr_checkbox_flag,
                                    clnt_svr_ip: (_1 = result[0]) === null || _1 === void 0 ? void 0 : _1.clnt_svr_ip,
                                    clnt_svr_port: (_2 = result[0]) === null || _2 === void 0 ? void 0 : _2.clnt_svr_port,
                                    clnt_svr_conn_interval: (_3 = result[0]) === null || _3 === void 0 ? void 0 : _3.clnt_svr_conn_interval,
                                    clnt_license: (_4 = result[0]) === null || _4 === void 0 ? void 0 : _4.clnt_license,
                                    clnt_exceptions_list: modifiedExcepIP,
                                    clnt_patterns_list: (_5 = result[0]) === null || _5 === void 0 ? void 0 : _5.clnt_patterns_list,
                                    svr_port: (_6 = result[0]) === null || _6 === void 0 ? void 0 : _6.svr_port,
                                    svr_file_retention_periods: (_7 = result[0]) === null || _7 === void 0 ? void 0 : _7.svr_file_retention_periods,
                                    svr_auto_fileupload: (_8 = result[0]) === null || _8 === void 0 ? void 0 : _8.svr_auto_fileupload,
                                },
                            ]);
                        }
                        else {
                            resolve([
                                {
                                    uid: (_9 = result[0]) === null || _9 === void 0 ? void 0 : _9.uid,
                                    svr_checkbox_flag: (_10 = result[0]) === null || _10 === void 0 ? void 0 : _10.svr_checkbox_flag,
                                    clnt_svr_ip: (_11 = result[0]) === null || _11 === void 0 ? void 0 : _11.clnt_svr_ip,
                                    clnt_svr_port: (_12 = result[0]) === null || _12 === void 0 ? void 0 : _12.clnt_svr_port,
                                    clnt_svr_conn_interval: (_13 = result[0]) === null || _13 === void 0 ? void 0 : _13.clnt_svr_conn_interval,
                                    clnt_license: (_14 = result[0]) === null || _14 === void 0 ? void 0 : _14.clnt_license,
                                    clnt_exceptions_list: (_15 = result[0]) === null || _15 === void 0 ? void 0 : _15.clnt_exceptions_list,
                                    clnt_patterns_list: (_16 = result[0]) === null || _16 === void 0 ? void 0 : _16.clnt_patterns_list,
                                    svr_port: (_17 = result[0]) === null || _17 === void 0 ? void 0 : _17.svr_port,
                                    svr_file_retention_periods: (_18 = result[0]) === null || _18 === void 0 ? void 0 : _18.svr_file_retention_periods,
                                    svr_auto_fileupload: (_19 = result[0]) === null || _19 === void 0 ? void 0 : _19.svr_auto_fileupload,
                                },
                            ]);
                        }
                    }
                }
            });
        });
    }
    addServerSetting() {
        return new Promise((resolve, reject) => {
            db_1.default;
        });
    }
    modServerSetting(server) {
        const autoDwn = server.auto ? 1 : 0;
        const query = `update serversetting set svr_port=${server.serverPort}, svr_file_retention_periods=${server.ret}, svr_auto_fileupload=${autoDwn}, svr_ui_refresh_interval=${server.interval}`;
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
    getServerSetting() {
        const query = `select svr_port, svr_file_retention_periods, svr_auto_fileupload, svr_ui_refresh_interval from serversetting`;
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
    getGUITime() {
        return new Promise((resolve, reject) => {
            const query = `select svr_ui_idle_timeout from serversetting`;
            db_1.default.query(query, (error, result) => {
                if (error) {
                    console.error("Error in query:", error);
                    reject(error);
                }
                else {
                    // 여기서 result 값이 어떤 형태인지 확인하고 적절한 값을 반환하도록 수정
                    const guiTimeout = result && result.length > 0 ? result[0].svr_ui_idle_timeout : 3600;
                    resolve(guiTimeout);
                }
            });
        });
    }
    getIntervalTime() {
        const query = "select svr_ui_refresh_interval from serversetting;";
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
    getProcessAccuracy() {
        const query = "select * from processaccuracy";
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
    addProcessAccuracy(procName) {
        const query = `insert into processaccuracy (proc_name) values ('${procName}')`;
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
    deleteProcessAccuracy(procName) {
        const query = `delete from processaccuracy where proc_name = '${procName}'`;
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
    updateFileAgent(updateFile) {
        const query = `update UpdateAgents set update_file = '${updateFile}'`;
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
    processFile(oldFile, newFile) {
        // 기존 파일 삭제
        fs_1.default.unlink(newFile, (err) => {
            if (err) {
                console.error("파일 삭제 중 오류 발생:", err);
                return false;
            }
            else {
                console.log("같은 경로의 파일이 삭제됨:", oldFile);
            }
        });
        // 새로운 파일의 naming 변경
        fs_1.default.rename(oldFile, newFile, (err) => {
            if (err) {
                console.error("파일 이름 변경 중 오류 발생:", err);
                return false;
            }
            else {
                console.log("같은 경로의 이름이 변경됨:", newFile);
            }
        });
        return true;
    }
    getUpdateFileAgent() {
        const query = 'select update_file as updateFile from updateagents';
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
    postUpdateFileAgent(updateFile) {
        const query = `update updateagents set update_file = 'C:/ciot/updates/${updateFile}'`;
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
    getOutlookFlag() {
        const query = "select svr_checkbox_flag as flag from serversetting";
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
exports.default = SettingService;
