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
    let kewordRef = agent.keywordList?.replace(/(\r\n|\n|\r)/gm, "@@");
    const query = `update serversetting set uid=${agent.uid}, clnt_svr_ip="${agent.serverIP}", clnt_svr_port=${agent.serverPort}, clnt_svr_conn_interval=${agent.serverInterval}, 
    clnt_license="${agent.licenseDist}", clnt_exceptions_list="${excip}", clnt_patterns_list="${kewordRef}", svr_checkbox_flag=${agent.flag}`;
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
      "select uid, svr_checkbox_flag, clnt_svr_ip, clnt_svr_port, clnt_svr_conn_interval, clnt_license, clnt_exceptions_list, clnt_patterns_list, svr_port, svr_file_retention_periods, svr_auto_fileupload from serversetting";
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          const clntKeywordList = result[0]?.clnt_patterns_list;
          const clntExceptionList = result[0]?.clnt_exceptions_list;
          
          if (clntKeywordList && clntKeywordList.includes("@@")) {
            const modifiedKeywordList = clntKeywordList.replace(/@@/g, "\n");
            if (clntExceptionList) {
              const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
              resolve([
                {
                  uid: result[0]?.uid,
                  svr_checkbox_flag: result[0]?.svr_checkbox_flag,
                  clnt_svr_ip: result[0]?.clnt_svr_ip,
                  clnt_svr_port: result[0]?.clnt_svr_port,
                  clnt_svr_conn_interval: result[0]?.clnt_svr_conn_interval,
                  clnt_license: result[0]?.clnt_license,
                  clnt_exceptions_list: modifiedExcepIP,
                  clnt_patterns_list: modifiedKeywordList,
                  svr_port: result[0]?.svr_port,
                  svr_file_retention_periods:
                    result[0]?.svr_file_retention_periods,
                  svr_auto_fileupload: result[0]?.svr_auto_fileupload,
                },
              ]);
            } else {
              resolve([
                {
                  uid: result[0]?.uid,
                  svr_checkbox_flag: result[0]?.svr_checkbox_flag,
                  clnt_svr_ip: result[0]?.clnt_svr_ip,
                  clnt_svr_port: result[0]?.clnt_svr_port,
                  clnt_svr_conn_interval: result[0]?.clnt_svr_conn_interval,
                  clnt_license: result[0]?.clnt_license,
                  clnt_exceptions_list: result[0]?.clnt_exceptions_list,
                  clnt_patterns_list: modifiedKeywordList,
                  svr_port: result[0]?.svr_port,
                  svr_file_retention_periods:
                    result[0]?.svr_file_retention_periods,
                  svr_auto_fileupload: result[0]?.svr_auto_fileupload,
                },
              ]);
            }
          } else {
            if (clntExceptionList) {
              const modifiedExcepIP = clntExceptionList.replace(/,\s*/gm, "\n");
              resolve([
                {
                  uid: result[0]?.uid,
                  svr_checkbox_flag: result[0]?.svr_checkbox_flag,
                  clnt_svr_ip: result[0]?.clnt_svr_ip,
                  clnt_svr_port: result[0]?.clnt_svr_port,
                  clnt_svr_conn_interval: result[0]?.clnt_svr_conn_interval,
                  clnt_license: result[0]?.clnt_license,
                  clnt_exceptions_list: modifiedExcepIP,
                  clnt_patterns_list: result[0]?.clnt_patterns_list,
                  svr_port: result[0]?.svr_port,
                  svr_file_retention_periods:
                    result[0]?.svr_file_retention_periods,
                  svr_auto_fileupload: result[0]?.svr_auto_fileupload,
                },
              ]);
            } else {
              resolve([
                {
                  uid: result[0]?.uid,
                  svr_checkbox_flag: result[0]?.svr_checkbox_flag,
                  clnt_svr_ip: result[0]?.clnt_svr_ip,
                  clnt_svr_port: result[0]?.clnt_svr_port,
                  clnt_svr_conn_interval: result[0]?.clnt_svr_conn_interval,
                  clnt_license: result[0]?.clnt_license,
                  clnt_exceptions_list: result[0]?.clnt_exceptions_list,
                  clnt_patterns_list: result[0]?.clnt_patterns_list,
                  svr_port: result[0]?.svr_port,
                  svr_file_retention_periods:
                    result[0]?.svr_file_retention_periods,
                  svr_auto_fileupload: result[0]?.svr_auto_fileupload,
                },
              ]);
            }
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
    const query = `update serversetting set svr_port=${server.serverPort}, svr_file_retention_periods=${server.ret}, svr_auto_fileupload=${autoDwn}, svr_ui_refresh_interval=${server.interval}`;
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
    const query = `select svr_port, svr_file_retention_periods, svr_auto_fileupload, svr_ui_refresh_interval from serversetting`;
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
      const query = `select svr_ui_idle_timeout from serversetting`;
      connection.query(query, (error, result) => {
        if (error) {
          console.error("Error in query:", error);
          reject(error);
        } else {
          // 여기서 result 값이 어떤 형태인지 확인하고 적절한 값을 반환하도록 수정
          const guiTimeout =
            result && result.length > 0 ? result[0].svr_ui_idle_timeout : 3600;
          resolve(guiTimeout);
        }
      });
    });
  }

  getIntervalTime(): Promise<any> {
    const query = "select svr_ui_refresh_interval from serversetting;";
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

  getProcessAccuracy(): Promise<any> {
    const query = "select * from processaccuracy";
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

  addProcessAccuracy(procName: any): Promise<any> {
    const query = `insert into processaccuracy (proc_name) values ('${procName}')`;
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

  deleteProcessAccuracy(procName: any): Promise<any> {
    const query = `delete from processaccuracy where proc_name = '${procName}'`;
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

  updateFileAgent(updateFile:any):Promise<any>{
    const query = `update updateagents set update_file = ${updateFile}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  getUpdateFileAgent(): Promise<any>{
    const query = 'select update_file as updateFile from updateagents';
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }
}

export default SettingService;
