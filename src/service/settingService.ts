import { IpRange } from "../interface/interface";
import connection from "../db/db";
import fs from "fs";

class SettingService {
  addAgentSetting(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  modAgentSettingLog(revData:any, currentData:any):string {
    let str = 'Change agent settings\t';
    // let str = '에이전트 설정 변경\t';

    if(revData?.serverIP !== currentData?.clnt_svr_ip) str += 'client ip = before(' + currentData?.clnt_svr_ip + '), after(' + revData?.serverIP + '), '; 
    if(revData?.serverPort !== currentData?.clnt_svr_port) str += 'client port = before(' + currentData?.clnt_svr_port + '), after(' + revData?.serverPort + '), '; 

    return str;
  }

  modAgentSetting(agent: {
    uid: number;
    serverIP?: string;
    serverPort?: number;
    serverInterval?: number;
    licenseDist?: string;
    exceptionList?: string;
    flag: number;
  }): Promise<any> {
    let excip = agent.exceptionList?.replace(/(\r\n|\n|\r)/gm, ", ");

    // db에 undefined가 문자열로 들어가는 것을 막기위한 예외처리
    if (excip === undefined) excip = "";

    const query = `update serversetting set uid=${agent.uid}, clnt_svr_ip="${agent.serverIP}", clnt_svr_port=${agent.serverPort}, clnt_svr_conn_interval=${agent.serverInterval}, 
    clnt_license="${agent.licenseDist}", clnt_exceptions_list="${excip}", svr_checkbox_flag=${agent.flag}`;
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
      "select uid, svr_checkbox_flag, clnt_svr_ip, clnt_svr_port, clnt_svr_conn_interval, clnt_license, clnt_exceptions_list, svr_port, svr_file_retention_periods, svr_auto_fileupload from serversetting";
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          const clntExceptionList = result[0]?.clnt_exceptions_list ?? "";
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
                svr_port: result[0]?.svr_port,
                svr_file_retention_periods:
                  result[0]?.svr_file_retention_periods,
                svr_auto_fileupload: result[0]?.svr_auto_fileupload,
              },
            ]);
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

  modServerSettingLog(revData:any, currentData:any):string {
    let str = 'Change server settings\t';
    // let str = '서버 설정 변경\t';

    if(revData?.serverPort !== currentData?.svr_port) str += 'server port = before(' + currentData?.svr_port + '), after(' + revData?.serverPort + ')'; 

    return str;
  }

  modServerSetting(server: {
    serverPort: string;
    ret: string;
    auto: boolean;
    interval: number;
    keywordList?: string;
  }): Promise<any> {
    const autoDwn = server.auto ? 1 : 0;
    let kewordRef = server.keywordList?.replace(/(\r\n|\n|\r)/gm, "@@");
    if (kewordRef === undefined) kewordRef = "";
    const query = `update serversetting set svr_port=${server.serverPort}, svr_file_retention_periods=${server.ret}, svr_auto_fileupload=${autoDwn}, svr_ui_refresh_interval=${server.interval}, svr_patterns_list="${kewordRef}"`;
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
    const query = `select svr_port, svr_file_retention_periods, svr_auto_fileupload, svr_ui_refresh_interval, svr_patterns_list from serversetting`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          const svrKeywordList = result[0]?.svr_patterns_list ?? "";
          if (svrKeywordList && svrKeywordList.includes("@@")) {
            const modifiedKeywordList = svrKeywordList.replace(/@@/g, "\n");
            resolve([
              {
                svr_port: result[0].svr_port,
                svr_file_retention_periods:
                  result[0].svr_file_retention_periods,
                svr_auto_fileupload: result[0].svr_auto_fileupload,
                svr_ui_refresh_interval: result[0].svr_ui_refresh_interval,
                svr_patterns_list: modifiedKeywordList,
              },
            ]);
          } else {
            resolve([
              {
                svr_port: result[0].svr_port,
                svr_file_retention_periods:
                  result[0].svr_file_retention_periods,
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

  updateFileAgent(updateFile: any): Promise<any> {
    const query = `update UpdateAgents set update_file = '${updateFile}'`;
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

  processFile(oldFile: any, newFile: any): boolean {
    // 기존 파일 삭제
    fs.unlink(newFile, (err) => {
      if (err) {
        console.error("파일 삭제 중 오류 발생:", err);
        return false;
      } else {
        console.log("같은 경로의 파일이 삭제됨:", oldFile);
      }
    });

    // 새로운 파일의 naming 변경
    fs.rename(oldFile, newFile, (err) => {
      if (err) {
        console.error("파일 이름 변경 중 오류 발생:", err);
        return false;
      } else {
        console.log("같은 경로의 이름이 변경됨:", newFile);
      }
    });

    return true;
  }

  getUpdateFileAgent(): Promise<any> {
    const query = "select update_file as updateFile from updateagents";
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

  postUpdateFileAgent(updateFile: any): Promise<any> {
    const query = `update updateagents set update_file = 'C:/ciot/updates/${updateFile}'`;
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

  getOutlookFlag(): Promise<any> {
    const query = "select svr_checkbox_flag as flag from serversetting";
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
