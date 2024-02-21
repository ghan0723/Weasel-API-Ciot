"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
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
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
                if (error) {
                    reject(error);
                }
                else {
                    const clntKeywordList = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.clnt_patterns_list;
                    const clntExceptionList = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.clnt_exceptions_list;
                    if (clntKeywordList && clntKeywordList.includes("@@")) {
                        const modifiedKeywordList = clntKeywordList === null || clntKeywordList === void 0 ? void 0 : clntKeywordList.replace(/@@/g, "\n");
                        const modifiedExcepIP = clntExceptionList === null || clntExceptionList === void 0 ? void 0 : clntExceptionList.replace(/,\s*/gm, "\n");
                        resolve([
                            {
                                uid: (_c = result[0]) === null || _c === void 0 ? void 0 : _c.uid,
                                svr_checkbox_flag: (_d = result[0]) === null || _d === void 0 ? void 0 : _d.svr_checkbox_flag,
                                clnt_svr_ip: (_e = result[0]) === null || _e === void 0 ? void 0 : _e.clnt_svr_ip,
                                clnt_svr_port: (_f = result[0]) === null || _f === void 0 ? void 0 : _f.clnt_svr_port,
                                clnt_svr_conn_interval: (_g = result[0]) === null || _g === void 0 ? void 0 : _g.clnt_svr_conn_interval,
                                clnt_license: (_h = result[0]) === null || _h === void 0 ? void 0 : _h.clnt_license,
                                clnt_exceptions_list: modifiedExcepIP,
                                clnt_patterns_list: modifiedKeywordList,
                                svr_port: (_j = result[0]) === null || _j === void 0 ? void 0 : _j.svr_port,
                                svr_file_retention_periods: (_k = result[0]) === null || _k === void 0 ? void 0 : _k.svr_file_retention_periods,
                                svr_auto_fileupload: (_l = result[0]) === null || _l === void 0 ? void 0 : _l.svr_auto_fileupload,
                            },
                        ]);
                    }
                    else {
                        resolve([
                            {
                                uid: (_m = result[0]) === null || _m === void 0 ? void 0 : _m.uid,
                                svr_checkbox_flag: (_o = result[0]) === null || _o === void 0 ? void 0 : _o.svr_checkbox_flag,
                                clnt_svr_ip: (_p = result[0]) === null || _p === void 0 ? void 0 : _p.clnt_svr_ip,
                                clnt_svr_port: (_q = result[0]) === null || _q === void 0 ? void 0 : _q.clnt_svr_port,
                                clnt_svr_conn_interval: (_r = result[0]) === null || _r === void 0 ? void 0 : _r.clnt_svr_conn_interval,
                                clnt_license: (_s = result[0]) === null || _s === void 0 ? void 0 : _s.clnt_license,
                                clnt_exceptions_list: (_t = result[0]) === null || _t === void 0 ? void 0 : _t.clnt_patterns_list,
                                clnt_patterns_list: (_u = result[0]) === null || _u === void 0 ? void 0 : _u.clnt_exceptions_list,
                                svr_port: (_v = result[0]) === null || _v === void 0 ? void 0 : _v.svr_port,
                                svr_file_retention_periods: (_w = result[0]) === null || _w === void 0 ? void 0 : _w.svr_file_retention_periods,
                                svr_auto_fileupload: (_x = result[0]) === null || _x === void 0 ? void 0 : _x.svr_auto_fileupload,
                            },
                        ]);
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
}
exports.default = SettingService;
