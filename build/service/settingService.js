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
        const query = `update usersettings set uid=${agent.uid}, clnt_server_ip="${agent.serverIP}", clnt_server_port=${agent.serverPort}, clnt_svr_att_interval=${agent.serverInterval}, 
    clnt_license_dist="${agent.licenseDist}", clnt_exception_list="${agent.exceptionList}", clnt_keyword_list="${agent.keywordList}", flag_checkbox=${agent.flag}`;
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
        const query = "select uid, flag_checkbox, clnt_server_ip, clnt_server_port, clnt_svr_att_interval, clnt_license_dist, clnt_exception_list, clnt_keyword_list, svr_server_port, svr_retention_period, svr_autodownload from usersettings";
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
    addServerSetting() {
        return new Promise((resolve, reject) => {
            db_1.default;
        });
    }
    modServerSetting(server) {
        const autoDwn = server.auto ? 1 : 0;
        const query = `update usersettings set svr_server_port=${server.serverPort}, svr_retention_period=${server.ret}, svr_autodownload=${autoDwn}, svr_update_interval=${server.interval}`;
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
        const query = `select svr_server_port, svr_retention_period, svr_autodownload, svr_update_interval from usersettings`;
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
            const query = `select svr_gui_timeout from usersettings`;
            db_1.default.query(query, (error, result) => {
                if (error) {
                    console.error("Error in query:", error);
                    reject(error);
                }
                else {
                    // 여기서 result 값이 어떤 형태인지 확인하고 적절한 값을 반환하도록 수정
                    const guiTimeout = result && result.length > 0 ? result[0].svr_gui_timeout : 3600;
                    resolve(guiTimeout);
                }
            });
        });
    }
    getIntervalTime() {
        const query = "select svr_update_interval from usersettings;";
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
