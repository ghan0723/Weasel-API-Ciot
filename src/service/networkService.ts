import { IpRange } from "../interface/interface";
import { Connection } from "mysql";
import fs from "fs";


class NetworkService {
  private connection: Connection;
  private query1!: number;
  private query2!: number;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Ko_Columns
  private columnAliasKo: any = {
      // alias    table명
    id: "id",                   // 0
    정확도: "accurate",         // 1
    탐지시각: "time",           // 2
    Pc명: "pc_name",            // 3
    AgentIP: "latest_agent_ip", // 4
    프로토콜: 'protocol',       // 5
    출발지IP: "src_ip",         // 6
    출발지PORT: "src_port",     // 7
    목적지IP: "dst_ip",         // 8
    목적지PORT: "dst_port",     // 9
    프로세스명: "proc_name",    // 10
    PID: "proc_id",             // 11
    유출파일명: "org_file",     // 12
    파일용량: "file_size",      // 13
    탐지패턴: "patterns",       // 14
    URL: "url",                 // 15
    파일다운로드: "backup_file", // 16
    스크린샷: "backup_file",     // 17
    upload_state: "upload_state", // 18
    scrdmp_upload_state:'scrdmp_upload_state', // 19
  };

  // New_Columns
  private columnAlias: any = {
    // alias    table명
    id: "id",                    // 0
    Accurancy: "accurate",       // 1
    Time: "time",                // 2
    PcName: "pc_name",           // 3
    Agent_ip: "latest_agent_ip", // 4
    protocol: 'protocol',        // 5
    SrcIp: "src_ip",             // 6
    SrcPort: "src_port",         // 7
    DstIp: "dst_ip",             // 8
    DstPort: "dst_port",         // 9
    Process: "proc_name",        // 10
    PIDs: "proc_id",             // 11
    SrcFile: "org_file",         // 12
    FileSizes: "file_size",      // 13
    Keywords: "patterns",        // 14
    DestFiles: "url",            // 15
    DownLoad: "backup_file",     // 16
    ScreenShot: "backup_file",   // 17
    upload_state: "upload_state", // 18
    scrdmp_upload_state: "scrdmp_upload_state" // 19
  };

  // Dashboard 일/주/월 건수
  getCountAll(select: any, ipRanges: IpRange[]): Promise<any> {
    let dayOption1: string;
    let dayOption2: string;

    if (select === "day") {
      dayOption1 = "CURDATE(), INTERVAL 0 DAY";
      dayOption2 = "CURDATE(), INTERVAL 1 DAY";
    } else if (select === "week") {
      dayOption1 = "CURDATE(), INTERVAL 1 WEEK";
      dayOption2 = "CURDATE(), INTERVAL 2 WEEK";
    } else {
      dayOption1 = "CURDATE(), INTERVAL 1 MONTH";
      dayOption2 = "CURDATE(), INTERVAL 2 MONTH";
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    return new Promise((resolve, reject) => {
      const query3 = `SELECT COUNT(*) as allfiles FROM leakednetworkfiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
      const query4 = `SELECT COUNT(*) as beforefiles FROM leakednetworkfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].allfiles;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query4, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforefiles;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            allfiles: this.query1,
            beforefiles:
              this.query2 !== 0
                ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                : ((this.query1 / 1) * 100).toFixed(2),
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 송신탐지내역 테이블
  getApiData(
    page: any,
    pageSize: any,
    sorting: any,
    desc: any,
    category: any,
    search: any,
    ipRanges: IpRange[],
    privilege: any,
    excel?:any
  ): Promise<any> {
    let queryPage: number = 0;
    let queryPageSize: number = 0;
    let querySorting: string = sorting === "" ? "time" : sorting;
    let queryDesc: string = desc === "false" ? "asc" : "desc";
    let whereClause = "";
    let aliasKey:any; 
    let aliasValues:any; 
    let convertColumns:any; 
    convertColumns = category !== "" && this.columnAlias[category];
    if(!excel){
      aliasKey = Object.keys(this.columnAlias);
      aliasValues = Object.values(this.columnAlias);
    } else{
      aliasKey = Object.keys(this.columnAliasKo);
      aliasValues = Object.values(this.columnAliasKo);
    }

    if (page !== undefined && !excel) {
      queryPage = Number(page);
    }

    if (pageSize !== undefined && !excel) {
      queryPageSize = Number(pageSize);
    }

    if (sorting === "" && desc === "") {
      sorting = "time";
      desc = "desc";
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");
    
    if (search !== "") {
      // Old_Columns
      // if(convertColumns ===  'accuracy') {
      if (convertColumns === aliasValues[1]) {
        // New_Columns
        // if(convertColumns ===  'accurate') {/

        if (/(정|탐|정탐)/i.test(search)) {
          whereClause = `where ${convertColumns} = '100' AND (${ipConditions})`;
        } else if (
          /(확|인|필|요|확인|인필|필요|확인필|인필요|확인필요)/i.test(search)
        ) {
          whereClause = `where ${convertColumns} != '100' AND (${ipConditions})`;
        } else {
          whereClause = `where ${convertColumns} > '100' AND (${ipConditions})`;
        }
      } else {
        whereClause = `where ${convertColumns} like ? AND (${ipConditions})`;
      }
    } else {
      whereClause = `where ${ipConditions}`;
    }

    return new Promise((resolve, reject) => {
      const queryStr =
        privilege !== 3
          ? `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, ` +
            `${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, ${aliasValues[9]} as ${aliasKey[9]}, ` +
            `${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]}, ${aliasValues[12]} as ${aliasKey[12]}, ` +
            `${aliasValues[13]} as ${aliasKey[13]}, ${aliasValues[14]} as ${aliasKey[14]}, ` +
            `${aliasValues[15]} as ${aliasKey[15]}, ${aliasValues[16]} as ${aliasKey[16]}, ${aliasValues[17]} as ${aliasKey[17]}, ${aliasValues[18]} as ${aliasKey[18]}, ${aliasValues[19]} as ${aliasKey[19]} `
          : `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, ` +
            `${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, ${aliasValues[9]} as ${aliasKey[9]}, ` +
            `${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]}, ${aliasValues[12]} as ${aliasKey[12]}, ` +
            `${aliasValues[13]} as ${aliasKey[13]}, ${aliasValues[14]} as ${aliasKey[14]}, ${aliasValues[15]} as ${aliasKey[15]} `;
            let query = "";
      if(!excel){
        query =
        queryStr +
        "from leakednetworkfiles " +
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
      } else {
        query =
        queryStr +
        "from leakednetworkfiles " +
        whereClause +
        " order by " +
        querySorting +
        " " +
        queryDesc +
        " " ;
      }

      const query2 =
        "select count(*) as count from leakednetworkfiles " + whereClause;
      const whereQuery = "%" + search + "%";      

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query, whereQuery, (error, result) => {
            const excludedKeys = ["파일다운로드","스크린샷","upload_state","scrdmp_upload_state"];
            const excludedKeysMonitor = ["DownLoad", "ScreenShot","파일다운로드","스크린샷","upload_state","scrdmp_upload_state"];

            if(!excel) {
              result.map((data:any,i:number) => {
                if(privilege !== 3) {
                  const date = data.Time.split(' ')[0];
                  const fileName = `C:/Program Files (x86)/ciot/WeaselServer/Temp/${date}/${data.Agent_ip}.${data.id}.${data.DownLoad}`;

                  // 파일 다운로드
                  if(fs.existsSync(`${fileName}.enc`) && result[i].upload_state === '2') {
                    result[i].DownLoad = `${data.Agent_ip}.${data.id}.${data.DownLoad}`;
                  } else if(result[i].upload_state === '3') {
                    result[i].DownLoad = result[i].upload_state;
                  } else {
                    result[i].DownLoad = '';
                  }
    
                  // 스크린샷
                  if((fs.existsSync(`${fileName}.png.enc`) || fs.existsSync(`${fileName}.jpg.enc`) || fs.existsSync(`${fileName}.jpeg.enc`)) && result[i].scrdmp_upload_state === '2') {
                    result[i].ScreenShot = `${data.Agent_ip}.${data.id}.${data.ScreenShot}`;
                  } else if(result[i].scrdmp_upload_state === '3') {
                    result[i].ScreenShot = result[i].scrdmp_upload_state;
                  } else {
                    result[i].ScreenShot = '';
                  }                  

                  if(result[i].protocol === '2') {
                    result[i].protocol = 'UDP';
                  } else {
                    result[i].protocol = 'TCP';
                  }

                  delete result[i].upload_state;
                  delete result[i].scrdmp_upload_state;
                } else {
                  if(result[i].protocol === '2') {
                    result[i].protocol = 'UDP';
                  } else {
                    result[i].protocol = 'TCP';
                  }
                  
                  delete result[i].DownLoad;
                  delete result[i].ScreenShot;
                }
              });
            } else {              
              result.map((data:any,i:number) => {
                if(data.정확도 === 100) {
                  data.정확도 = '정탐';
                } else {
                  data.정확도 = '확인필요';
                }

                if(data.프로토콜 === 2) {
                  data.프로토콜 = 'UDP';
                } else {
                  data.프로토콜 = 'TCP';
                }

                delete result[i].파일다운로드;
                delete result[i].스크린샷;
              });
            }

            const filteredKeys =
              privilege !== 3
                ? aliasKey.filter((key:any) => !excludedKeys.includes(key))
                : aliasKey.filter((key:any) => !excludedKeysMonitor.includes(key));

            // 검색 결과가 없을 경우의 처리
            if (result.length === 0) {
              result[0] = filteredKeys.reduce((obj: any, key: any) => {
                obj[key] = "";
                return obj;
              }, {});
            }
            if (error) {
              innerReject(error);
            } else {
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query2, whereQuery, (error, result) => {
            if (result[0].count === 0) {
              result[0].count = 1;
            }
            if (error) {
              innerReject(error);
            } else {
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

  // 송신탐지내역 테이블 데이터 삭제
  getUpdateUpLoad(id:any,name:any) {
    let columnName = 'upload_state';
    if(name === 'screenshot') {
      columnName = 'scrdmp_upload_state';
    }

    const query = `update leakednetworkfiles set ${columnName} = 1 WHERE id = ${id}`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // 송신탐지내역 테이블 데이터 삭제
  postRemoveData(body: string[]) {
    // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
    const idString = body.map((id) => `'${id}'`).join(", ");
    const query = `DELETE FROM leakednetworkfiles WHERE id IN (${idString})`;

    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // DummyData 생성
  async getDummyData(count: any) {
    const date = new Date();
    let queryDay: number;
    let queryMonth: number;
    let queryDayStr: string;
    let queryMonthStr: string;
    let queryYearStr: string;

    for (let i = 0; i < count; i++) {
      let accuracy = i % 3 === 0 ? 100 : 0;

      // 날짜 계산
      date.setDate(date.getDate() - 1);
      if (date.getDate() === 0) date.setDate(0);

      queryDay = date.getDate();
      queryMonth = date.getMonth() + 1;
      queryYearStr = date.getFullYear().toString();

      if (queryDay < 10) {
        queryDayStr = "0" + queryDay;
      } else {
        queryDayStr = queryDay.toString();
      }

      if (queryMonth < 10) {
        queryMonthStr = "0" + queryMonth;
      } else {
        queryMonthStr = queryMonth.toString();
      }

      const query = `INSERT INTO leakednetworkfiles (
        time,
        pc_name,
        proc_name,
        pid,
        latest_agent_ip,
        src_ip,
        src_port,
        dst_ip,
        dst_port,
        src_file,
        down_state,
        scrshot_downloaded,
        file_size,
        patterns,
        dst_file,
        saved_file,
        accuracy,
        evCO,
        evFA,
        evSA,
        isprinted,
        asked_file
      ) VALUES (
        '${queryYearStr}-${queryMonthStr}-${queryDayStr} 15:00:29',
        'PCName${count}',
        'Process${count}',
        '123456',
        '10.10.10.126',
        '192.168.1.1',
        '12345',
        '192.168.1.3',
        '54321',
        'path/to/source/file.txt',
        'YES',
        'YES',
        '123456789',
        'Keyword1, Keyword2, Keyword3',
        'path/to/destination/file.txt',
        'path/to/saved/file.txt',
        ${accuracy},
        'EventCO',
        'EventFA',
        'EventSA',
        1,
        1 
      );`;

      // New_Columns
      // const query = `INSERT INTO LeakedNetworkFiles (
      //   time,
      //   pc_name,
      //   proc_name,
      //   pc_guid,
      //   proc_id,
      //   latest_agent_ip,
      //   src_ip,
      //   src_port,
      //   dst_ip,
      //   dst_port,
      //   org_file,
      //   upload_state,
      //   scrdmp_upload_state,
      //   file_size,
      //   patterns,
      //   url,
      //   backup_file,
      //   accurate,
      //   eventCO,
      //   eventFA,
      //   eventSA
      // ) VALUES (
      //   '${queryYearStr}-${queryMonthStr}-${queryDayStr} 15:00:29',
      //   'PCName${count}',
      //   'Process${count}',
      //   'Pcguid${count}',
      //   '123456',
      //   '10.10.10.126',
      //   '192.168.1.1',
      //   '12345',
      //   '192.168.1.3',
      //   '54321',
      //   'path/to/source/file.txt',
      //   'YES',
      //   'YES',
      //   '123456789',
      //   'Keyword1, Keyword2, Keyword3',
      //   'path/to/destination/file.txt',
      //   'path/to/saved/file.txt',
      //   ${accuracy},
      //   'EventCO',
      //   'EventFA',
      //   'EventSA'
      // );`;

      try {
        const result = await new Promise((resolve, reject) => {
          this.connection.query(query, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

      } catch (error) {
      }
    }
  }

  public deleteFileDecrypt(filePath:any) {
    let currentFile:any;
    filePath.map((filename:any) => {
      if(fs.existsSync(`${filename}`)) {
        currentFile = filename;
      }
    });    

    return new Promise((resolve, reject) => {
      fs.unlink(currentFile, (err:any) => {
        if(err) {
          console.error('Error deleting file:', err);
          return reject(err);
        }
      });
      return resolve('success');
    });

  }

  public fileDecrypt(encryptedFileNames:any[], pc_guid:string) {
    const {exec} = require('child_process');
    const openSSLPath = 'C:/Program Files (x86)/ciot/WeaselServer/openssl'; // openssl의 절대 경로
    let cryptedFileName;
    let encryptedFileName:any;

    encryptedFileNames.map((filename:any) => {
      if(fs.existsSync(`${filename}.enc`)) {
        cryptedFileName = filename;
        encryptedFileName = filename;
      }
    });

    const command = `"${openSSLPath}" enc -d -aes-256-cbc -md sha256 -a -k ${pc_guid}_ -pbkdf2 -in "${cryptedFileName}.enc" -out "${encryptedFileName}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error:any, stdout:any, stderr:any) => {
        if (error) {
            console.error(`Error decrypting file: ${error.message}`);
            reject(error);
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            reject(error);
        }

        resolve(encryptedFileName);
      });
    });

  }

  // 송신탐지내역 테이블 데이터 삭제
  getPcGUID(id: string, name:string) {
    let query = ``;
    if(name === 'network'){
      query = `select pc_guid FROM leakednetworkfiles WHERE id = ${id}`;
    } else if (name === 'media'){
      query = `select pc_guid FROM leakedmediafiles WHERE id = ${id}`;
    } else if (name === 'outlook'){
      query = `select pc_guid FROM leakedoutlookfiles WHERE id = ${id}`;
    } else {
      query = `select pc_guid FROM leakedprintingfiles WHERE id = ${id}`;
    }

    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default NetworkService;
