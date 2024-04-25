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
    id: "id", // 0
    정확도: "accurate", // 1
    탐지시각: "time", // 2
    Pc명: "pc_name", // 3
    AgentIP: "latest_agent_ip", // 4
    출발지IP: "src_ip", // 5
    출발지PORT: "src_port", // 6
    목적지IP: "dst_ip", // 7
    목적지PORT: "dst_port", // 8
    프로세스명: "proc_name", // 9
    PID: "proc_id", // 10
    유출파일명: "org_file", // 11
    파일용량: "file_size", // 12
    탐지패턴: "patterns", // 13
    URL: "url", // 14
    파일다운로드: "backup_file", // 15
    스크린샷: "backup_file", // 16
  };

  // New_Columns
  private columnAlias: any = {
    // alias    table명
    id: "id", // 0
    Accurancy: "accurate", // 1
    Time: "time", // 2
    PcName: "pc_name", // 3
    Agent_ip: "latest_agent_ip", // 4
    SrcIp: "src_ip", // 5
    SrcPort: "src_port", // 6
    DstIp: "dst_ip", // 7
    DstPort: "dst_port", // 8
    Process: "proc_name", // 9
    PIDs: "proc_id", // 10
    SrcFile: "org_file", // 11
    FileSizes: "file_size", // 12
    Keywords: "patterns", // 13
    DestFiles: "url", // 14
    DownLoad: "backup_file", // 15
    ScreenShot: "backup_file", // 16
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

    if (page !== undefined) {
      queryPage = Number(page);
    }

    if (pageSize !== undefined) {
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
            `${aliasValues[15]} as ${aliasKey[15]}, ${aliasValues[16]} as ${aliasKey[16]} `
          : `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, ` +
            `${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, ${aliasValues[9]} as ${aliasKey[9]}, ` +
            `${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]}, ${aliasValues[12]} as ${aliasKey[12]}, ` +
            `${aliasValues[13]} as ${aliasKey[13]}, ${aliasValues[14]} as ${aliasKey[14]} `;

      const query =
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

      const query2 =
        "select count(*) as count from leakednetworkfiles " + whereClause;
      const whereQuery = "%" + search + "%";      

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query, whereQuery, (error, result) => {
            const excludedKeys = ["파일다운로드","스크린샷"];
            const excludedKeysMonitor = ["DownLoad", "ScreenShot","파일다운로드","스크린샷"];

            if(!excel) {
              result.map((data:any,i:number) => {
                if(privilege !== 3) {
                  const date = data.Time.split(' ')[0];
                  const fileName = `C:/Program Files (x86)/ciot/WeaselServer/Temp/${date}/${data.Agent_ip}.${data.id}.${data.DownLoad}`;
                  
                  if(fs.existsSync(fileName)) {
                    result[i].DownLoad = `${data.Agent_ip}.${data.id}.${data.DownLoad}`;
                  } else {
                    result[i].DownLoad = '';
                  }
    
                  if(fs.existsSync(`${fileName}.png`)) {
                    result[i].ScreenShot = `${data.Agent_ip}.${data.id}.${data.ScreenShot}`;
                  } else {
                    result[i].ScreenShot = '';
                  }
                } else {
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
        console.log(`데이터 삽입 ${i + 1}번째 실패: ${error}`);
      }
    }
  }
}

export default NetworkService;
