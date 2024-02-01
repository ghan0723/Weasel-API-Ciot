import { IpRange } from "../interface/interface";
import connection from "../db/db";

class SettingService {
  addAgentSetting(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  modAgentSetting(agent: {
    uid: number;
    serverIP?: string;
    serverPort?: number;
    serverInterval?: number;
    licenseDist?: string;
    exceptionList?: string;
    keywordList?: string;
    flag: number;
  }): Promise<any> {
    let excip = agent.exceptionList?.replace(/(\r\n|\n|\r)/gm, ", ");
    let kewordRef = agent.keywordList?.replace(/(\r\n|\n|\r)/gm, "&&");
    const query = `update usersettings set uid=${agent.uid}, clnt_server_ip="${agent.serverIP}", clnt_server_port=${agent.serverPort}, clnt_svr_att_interval=${agent.serverInterval}, 
    clnt_license_dist="${agent.licenseDist}", clnt_exception_list="${excip}", clnt_keyword_list="${kewordRef}", flag_checkbox=${agent.flag}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getAgentSetting(): Promise<any> {
    const query =
      "select uid, flag_checkbox, clnt_server_ip, clnt_server_port, clnt_svr_att_interval, clnt_license_dist, clnt_exception_list, clnt_keyword_list, svr_server_port, svr_retention_period, svr_autodownload from usersettings";
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          const clntKeywordList = result[0]?.clnt_keyword_list;
          const clntExceptionList = result[0]?.clnt_exception_list;
          if (clntKeywordList && clntKeywordList.includes("&&")) {
            const modifiedKeywordList = clntKeywordList.replace(/&&/g, "\n");
            const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
            resolve([{
              uid:result[0]?.uid,
              flag_checkbox:result[0]?.flag_checkbox,
              clnt_server_ip:result[0]?.clnt_server_ip,
              clnt_server_port:result[0]?.clnt_server_port,
              clnt_svr_att_interval:result[0]?.clnt_svr_att_interval,
              clnt_license_dist:result[0]?.clnt_license_dist,
              clnt_exception_list:modifiedExcepIP,
              clnt_keyword_list:modifiedKeywordList,
              svr_server_port:result[0]?.svr_server_port,
              svr_retention_period:result[0]?.svr_retention_period,
              svr_autodownload:result[0]?.svr_autodownload,
            }])
          } else {
            resolve(result);
          }
        }
      });
    });
  }

  addServerSetting(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  modServerSetting(server: {
    serverPort: string;
    ret: string;
    auto: boolean;
    interval: number;
  }): Promise<any> {
    const autoDwn = server.auto ? 1 : 0;
    const query = `update usersettings set svr_server_port=${server.serverPort}, svr_retention_period=${server.ret}, svr_autodownload=${autoDwn}, svr_update_interval=${server.interval}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getServerSetting(): Promise<any> {
    const query = `select svr_server_port, svr_retention_period, svr_autodownload, svr_update_interval from usersettings`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  public getGUITime(): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `select svr_gui_timeout from usersettings`;
      connection.query(query, (error, result) => {
        if (error) {
          console.error("Error in query:", error);
          reject(error);
        } else {
          // 여기서 result 값이 어떤 형태인지 확인하고 적절한 값을 반환하도록 수정
          const guiTimeout =
            result && result.length > 0 ? result[0].svr_gui_timeout : 3600;
          resolve(guiTimeout);
        }
      });
    });
  }

  getIntervalTime(): Promise<any> {
    const query = "select svr_update_interval from usersettings;";
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default SettingService;
