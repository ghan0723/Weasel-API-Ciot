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
    // check된 항목만 적용
    checkModAgent(currentData, newData) {
        let result = newData;
        // 서버 IP
        if (!((newData.flag & 1) === 1)) {
            result.serverIP = currentData.clnt_svr_ip;
        }
        // 서버 Port
        if (!((newData.flag & 2) === 2)) {
            result.serverPort = currentData.clnt_svr_port;
        }
        // 서버 접속 주기
        if (!((newData.flag & 32) === 32)) {
            result.serverInterval = currentData.clnt_svr_conn_interval;
        }
        // 라이센스 배포
        if (!((newData.flag & 8) === 8)) {
            result.licenseDist = currentData.clnt_license;
        }
        // // 탐지 시 스크린샷 자동 생성 및 다운로드
        // if(!((newData.flag & 128) === 128)) {
        // }
        // // (유출탐지 기능) Outlook 보낸편지함 메일 수집
        // if(!((newData.flag & 256) === 256)) {
        // }
        // 감시 예외대역
        if (!((newData.flag & 16) === 16)) {
            result.exceptionList = currentData.clnt_exceptions_list;
        }
        return result;
    }
    modAgentSettingLog(revData, currentData) {
        let str = '';
        // let str = '에이전트 설정 변경에 성공하였습니다.';
        if ((revData === null || revData === void 0 ? void 0 : revData.serverIP) !== (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_ip) && (revData === null || revData === void 0 ? void 0 : revData.serverPort) !== (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_port)) {
            str += 'Successfully changed agent settings The main changes are server IP changed to ' + (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_ip) + ' -> ' + (revData === null || revData === void 0 ? void 0 : revData.serverIP) + ' and server PORT changed to ' + (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_port) + ' -> ' + (revData === null || revData === void 0 ? void 0 : revData.serverPort) + '.';
            // str += '에이전트 설정 변경에 성공하였습니다 주요 변경 사항인 서버 ip가 ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + '로, 서버 port가 '+ currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.';
        }
        else if ((revData === null || revData === void 0 ? void 0 : revData.serverIP) !== (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_ip) && (revData === null || revData === void 0 ? void 0 : revData.serverPort) === (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_port)) {
            str += 'Successfully changed agent settings Server IP changed from ' + (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_ip) + ' -> ' + (revData === null || revData === void 0 ? void 0 : revData.serverIP) + '.';
            // str += '주요 변경 사항인 서버 ip가 ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + '로 변경되었습니다.';
        }
        else if ((revData === null || revData === void 0 ? void 0 : revData.serverIP) === (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_ip) && (revData === null || revData === void 0 ? void 0 : revData.serverPort) !== (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_port)) {
            str += 'Successfully changed agent settings The main change, the server port, has been changed from ' + (currentData === null || currentData === void 0 ? void 0 : currentData.clnt_svr_port) + ' -> ' + (revData === null || revData === void 0 ? void 0 : revData.serverPort) + '.';
            // str += '주요 변경 사항인 서버 port가 ' + currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.';
        }
        else {
            str += 'The agent settings change was successful.';
        }
        return str;
    }
    modAgentSetting(agent) {
        var _a;
        let excip = (_a = agent.exceptionList) === null || _a === void 0 ? void 0 : _a.replace(/(\r\n|\n|\r)/gm, ", ");
        // db에 undefined가 문자열로 들어가는 것을 막기위한 예외처리
        if (excip === undefined)
            excip = "";
        const query = `update serversetting set uid=${agent.uid}, clnt_svr_ip="${agent.serverIP}", clnt_svr_port=${agent.serverPort}, clnt_svr_conn_interval=${agent.serverInterval}, 
    clnt_license="${agent.licenseDist}", clnt_exceptions_list="${excip}", svr_checkbox_flag=${agent.flag}`;
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
        const query = "select uid, svr_checkbox_flag, clnt_svr_ip, clnt_svr_port, clnt_svr_conn_interval, clnt_license, clnt_exceptions_list, svr_port, svr_file_retention_periods, svr_auto_fileupload from serversetting";
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                if (error) {
                    reject(error);
                }
                else {
                    const clntExceptionList = (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.clnt_exceptions_list) !== null && _b !== void 0 ? _b : "";
                    if (clntExceptionList) {
                        const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
                        resolve([
                            {
                                uid: (_c = result[0]) === null || _c === void 0 ? void 0 : _c.uid,
                                svr_checkbox_flag: (_d = result[0]) === null || _d === void 0 ? void 0 : _d.svr_checkbox_flag,
                                clnt_svr_ip: (_e = result[0]) === null || _e === void 0 ? void 0 : _e.clnt_svr_ip,
                                clnt_svr_port: (_f = result[0]) === null || _f === void 0 ? void 0 : _f.clnt_svr_port,
                                clnt_svr_conn_interval: (_g = result[0]) === null || _g === void 0 ? void 0 : _g.clnt_svr_conn_interval,
                                clnt_license: (_h = result[0]) === null || _h === void 0 ? void 0 : _h.clnt_license,
                                clnt_exceptions_list: modifiedExcepIP,
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
                                clnt_exceptions_list: (_t = result[0]) === null || _t === void 0 ? void 0 : _t.clnt_exceptions_list,
                                svr_port: (_u = result[0]) === null || _u === void 0 ? void 0 : _u.svr_port,
                                svr_file_retention_periods: (_v = result[0]) === null || _v === void 0 ? void 0 : _v.svr_file_retention_periods,
                                svr_auto_fileupload: (_w = result[0]) === null || _w === void 0 ? void 0 : _w.svr_auto_fileupload,
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
    modServerSettingLog(revData, currentData) {
        let str = 'You have successfully changed the server settings. ';
        // let str = '서버 설정 변경에 성공하였습니다.';
        if ((revData === null || revData === void 0 ? void 0 : revData.serverPort) !== (currentData === null || currentData === void 0 ? void 0 : currentData.svr_port))
            str += ' the main change being the server port from ' + (currentData === null || currentData === void 0 ? void 0 : currentData.svr_port) + ' -> ' + (revData === null || revData === void 0 ? void 0 : revData.serverPort);
        // if(revData?.serverPort !== currentData?.svr_port) str += ' 주요 변경 사항인 서버 포트가 ' + currentData?.svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.'; 
        return str;
    }
    modServerSetting(server) {
        var _a;
        const autoDwn = server.auto ? 1 : 0;
        let kewordRef = (_a = server.keywordList) === null || _a === void 0 ? void 0 : _a.replace(/(\r\n|\n|\r)/gm, "@@");
        if (kewordRef === undefined)
            kewordRef = "";
        const query = `update serversetting set svr_port=${server.serverPort}, svr_file_retention_periods=${server.ret}, svr_auto_fileupload=${autoDwn}, svr_ui_refresh_interval=${server.interval}, svr_patterns_list="${kewordRef}"`;
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
        const query = `select svr_port, svr_file_retention_periods, svr_auto_fileupload, svr_ui_refresh_interval, svr_patterns_list from serversetting`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                var _a, _b;
                if (error) {
                    reject(error);
                }
                else {
                    const svrKeywordList = (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.svr_patterns_list) !== null && _b !== void 0 ? _b : "";
                    if (svrKeywordList && svrKeywordList.includes("@@")) {
                        const modifiedKeywordList = svrKeywordList.replace(/@@/g, "\n");
                        resolve([
                            {
                                svr_port: result[0].svr_port,
                                svr_file_retention_periods: result[0].svr_file_retention_periods,
                                svr_auto_fileupload: result[0].svr_auto_fileupload,
                                svr_ui_refresh_interval: result[0].svr_ui_refresh_interval,
                                svr_patterns_list: modifiedKeywordList,
                            },
                        ]);
                    }
                    else {
                        resolve([
                            {
                                svr_port: result[0].svr_port,
                                svr_file_retention_periods: result[0].svr_file_retention_periods,
                                svr_auto_fileupload: result[0].svr_auto_fileupload,
                                svr_ui_refresh_interval: result[0].svr_ui_refresh_interval,
                                svr_patterns_list: result[0].svr_patterns_list,
                            },
                        ]);
                    }
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
    checkProcessAccuracy(procName) {
        const query = `select count(*) as result from processaccuracy where proc_name = '${procName}'`;
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
        const query = "select update_file as updateFile from updateagents";
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
