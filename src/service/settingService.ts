import { IpRange } from "../interface/interface";
import connection from "../db/db";
import fs from "fs";

class SettingService {
  addAgentSetting(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection;
    });
  }

  // check된 항목만 적용
  checkModAgent(currentData:any, newData:{uid: number,serverIP?: string,serverPort?: number,serverInterval?: number,
                                          licenseDist?: string,exceptionList?: string,flag: number}):any {
    let result = newData;
    
    // 서버 IP
    if(!((newData.flag & 1) === 1)) {
      result.serverIP = currentData.clnt_svr_ip;
    }
    // 서버 Port
    if(!((newData.flag & 2) === 2)) {
      result.serverPort = currentData.clnt_svr_port;
    }
    // 서버 접속 주기
    if(!((newData.flag & 32) === 32)) {
      result.serverInterval = currentData.clnt_svr_conn_interval;
    }
    // 라이센스 배포
    if(!((newData.flag & 8) === 8)) {
      result.licenseDist = currentData.clnt_license;
    }
    // // 탐지 시 스크린샷 자동 생성 및 다운로드
    // if(!((newData.flag & 128) === 128)) {

    // }
    // // (유출탐지 기능) Outlook 보낸편지함 메일 수집
    // if(!((newData.flag & 256) === 256)) {
      
    // }
    // 감시 예외대역
    if(!((newData.flag & 16) === 16)) {
      result.exceptionList = currentData.clnt_exceptions_list;
    }

    return result;
  }

  modAgentSettingLog(revData:any, currentData:any):string {
    let str = '';
    // let str = '에이전트 설정 변경에 성공하였습니다.';

    if(revData?.serverIP !== currentData?.clnt_svr_ip && revData?.serverPort !== currentData?.clnt_svr_port){
      str += 'Successfully changed agent settings The main changes are server IP changed to ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + ' and server PORT changed to '+ currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '.';
      // str += '에이전트 설정 변경에 성공하였습니다 주요 변경 사항인 서버 ip가 ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + '로, 서버 port가 '+ currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.';
    } else if (revData?.serverIP !== currentData?.clnt_svr_ip && revData?.serverPort === currentData?.clnt_svr_port){
      str += 'Successfully changed agent settings Server IP changed from ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + '.'; 
      // str += '주요 변경 사항인 서버 ip가 ' + currentData?.clnt_svr_ip + ' -> ' + revData?.serverIP + '로 변경되었습니다.';
    } else if (revData?.serverIP === currentData?.clnt_svr_ip && revData?.serverPort !== currentData?.clnt_svr_port){
      str += 'Successfully changed agent settings The main change, the server port, has been changed from ' + currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '.'; 
      // str += '주요 변경 사항인 서버 port가 ' + currentData?.clnt_svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.';
    } else {
      str += 'The agent settings change was successful.';
    }

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
    let excip = "";
    // db에 undefined가 문자열로 들어가는 것을 막기위한 예외처리
    if (agent.exceptionList === undefined || agent.exceptionList === null){
      excip = "";
    } else {
      excip = agent.exceptionList?.replace(/(\r\n|\n|\r)/gm, ", ");
    }

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
    let str = 'You have successfully changed the server settings. ';
    // let str = '서버 설정 변경에 성공하였습니다.';

    if(revData?.serverPort !== currentData?.svr_port) str += ' the main change being the server port from ' + currentData?.svr_port + ' -> ' + revData?.serverPort; 
    // if(revData?.serverPort !== currentData?.svr_port) str += ' 주요 변경 사항인 서버 포트가 ' + currentData?.svr_port + ' -> ' + revData?.serverPort + '로 변경되었습니다.'; 

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

  checkProcessAccuracy(procName: any): Promise<any> {
    const query = `select count(*) as result from processaccuracy where proc_name = '${procName}'`;
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
        return false;
      } else {
      }
    });

    // 새로운 파일의 naming 변경
    fs.rename(oldFile, newFile, (err) => {
      if (err) {
        return false;
      } else {
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
