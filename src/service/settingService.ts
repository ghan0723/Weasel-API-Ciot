import connection from "../db/db";

class SettingService {
  addAgentSetting(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  modAgentSetting(agent: {
    uid: number;
    serverIP: string;
    serverPort: string;
    serverInterval: number;
    licenseDist: string;
    exceptionList: string;
    keywordList: string;
    flag: number;
  }): Promise<any> {
    const query = `update usersettings set uid=${agent.uid}, clnt_server_ip="${agent.serverIP}", clnt_server_port=${agent.serverPort}, clnt_svr_att_interval=${agent.serverInterval}, 
    clnt_license_dist="${agent.licenseDist}", clnt_exception_list="${agent.exceptionList}", clnt_keyword_list="${agent.keywordList}", flag_checkbox=${agent.flag}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error) {
            reject(error);
        } else {
            resolve(result);
        }
      })
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
          resolve(result);
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
  }): Promise<any> {
    const autoDwn = server.auto ? 1 : 0;
    const query = `update usersettings set svr_server_port=${server.serverPort}, svr_retention_period=${server.ret}, svr_autodownload=${autoDwn}`;
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
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  getIntervalTime() : Promise<any> {
    const query =
      "select svr_update_interval from usersettings;";
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
