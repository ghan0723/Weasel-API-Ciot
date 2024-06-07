import { IpRange } from "../interface/interface";
import connection from "../db/db";
import { generateRandomDateTime } from "../interface/generateRandom";
import fs from "fs";

class PrintService {
  private query1!: number;
  private query2!: number;

  // Old_C
  private columnAliasKo:any = {
    // alias    table명
    'id' : 'id',                       // 0
    탐지시각 : 'time',                   // 1
    PC명 : 'pc_name',               // 2
    AGENTIP : 'latest_agent_ip',           // 3
    프로세스명 : 'proc_name',             // 4
    PID : 'proc_id',                    // 5
    프린터 : 'printer',            // 6
    관리자 : 'doc_owner',                // 7
    인쇄파일명 : 'doc_name',          // 8
    // SPLFILE : 'spl_file', // 9 => 사용 안함
    복사본크기 : 'file_size',                  // 9
    페이지 : 'doc_pages',                 // 10
    파일다운로드 : 'spl_file',        // 11
    upload_state: "upload_state", // 12
  };

  // New_C
  private columnAlias:any = {
    // alias    table명
    'id' : 'id',                       // 0
    'Time' : 'time',                   // 1
    'PcName' : 'pc_name',               // 2
    'Agent_ip' : 'latest_agent_ip',           // 3
    'Process' : 'proc_name',             // 4
    'PIDs' : 'proc_id',                    // 5
    'Printers' : 'printer',            // 6
    'Owners' : 'doc_owner',                // 7
    'Documents' : 'doc_name',          // 8
    // 'Copied_Spool_Files' : 'spl_file', // 9 => 사용 안함
    'Sizes' : 'file_size',                  // 9
    'Pages' : 'doc_pages',                 // 10
    'Downloading' : 'spl_file',        // 11
    'upload_state': "upload_state", // 12
  };

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
      const query = `SELECT COUNT(*) as allprints FROM leakedprintingfiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
      const query3 = `SELECT COUNT(*) as beforeprints FROM leakedprintingfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].allprints;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforeprints;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            allprints: this.query1,
            beforeprints:
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

  getApiData(page: any, pageSize: any,sorting:any,desc:any,category:any,search:any, ipRanges: IpRange[],privilege:any, excel?:any): Promise<any> {
    let queryPage:number=0;
    let queryPageSize:number=0;
    let querySorting:string=sorting === '' ? 'time' : sorting;
    let queryDesc:string=desc === 'false' ? 'asc' : 'desc';
    let whereClause = '';
    let aliasKey:any; 
    let aliasValues:any; 
    let convertColumns:any; 
    convertColumns = category !== "" && this.columnAlias[category];
    if(!excel){
      aliasKey = Object.keys(this.columnAlias);
      aliasValues = Object.values(this.columnAlias);
      
    }else{
      aliasKey = Object.keys(this.columnAliasKo);
      aliasValues = Object.values(this.columnAliasKo);
    }

    if(page !== undefined) {      
      queryPage = Number(page);
    }

    if(pageSize !== undefined) {
      queryPageSize = Number(pageSize);
    }

    if(sorting === '' && desc === '') {
      sorting = 'time';
      desc = 'desc';
    }    
    
    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    if(search !== '') {
      whereClause = `where ${convertColumns} like ? AND (${ipConditions})`;
    } else {
      whereClause = `where ${ipConditions}`;
    }

    return new Promise((resolve, reject) => {
      const queryStr = privilege !== 3 ?
      `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, 
      ${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]},
      ${aliasValues[9]} as ${aliasKey[9]}, ${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]}
      , ${aliasValues[12]} as ${aliasKey[12]} `
        :
        `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, 
        ${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, 
        ${aliasValues[9]} as ${aliasKey[9]}, ${aliasValues[10]} as ${aliasKey[10]} `;
        let query = '';
      if(!excel){
        query =
        queryStr +
        "from leakedprintingfiles " +
         whereClause +
        ' order by '+ querySorting + ' ' + queryDesc + ' ' +
        'LIMIT ' + queryPageSize + ' offset ' + queryPage*queryPageSize;
      } else {
        query =
        queryStr +
        "from leakedprintingfiles " +
         whereClause +
        ' order by '+ querySorting + ' ' + queryDesc + ' ';
      }

      const query2 = "select count(*) as count from leakedprintingfiles " + whereClause;
      const whereQuery = '%' + search + '%';;

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query,whereQuery, (error, result) => {
            const excludedKeys = ['파일다운로드','upload_state'];
            const excludedKeysMonitor = ['Downloading','파일다운로드','upload_state'];

            if(!excel) {
              result.map((data:any,i:number) => {
                if(privilege !== 3) {
                  const date = data.Time.split(' ')[0];
                  const fileName = `C:/Program Files (x86)/ciot/WeaselServer/Temp/${date}/${data.Agent_ip}.${data.id}.${data.Downloading}`;
                  
                  if(fs.existsSync(`${fileName}.enc`) && result[i].upload_state === '2') {
                    result[i].Downloading = `${data.Agent_ip}.${data.id}.${data.Downloading}`;
                  } else if(result[i].upload_state === '3') {
                    result[i].Downloading = result[i].upload_state;
                  } else {
                    result[i].Downloading = '';
                  }

                  delete result[i].upload_state;
                } else {
                  delete result[i].Downloading;
                }
              });
            } else {              
              result.map((data:any,i:number) => {
                delete result[i].파일다운로드;
              });
            }

            const filteredKeys =
              privilege !== 3
                ? aliasKey.filter((key:any) => !excludedKeys.includes(key))
                : aliasKey.filter((key:any) => !excludedKeysMonitor.includes(key));

            // 검색 결과가 없을 경우의 처리
            if(result.length === 0) {
              result[0] = filteredKeys.reduce((obj:any, key:any) => {
                obj[key] = '';
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
          connection.query(query2,whereQuery, (error, result) => {

            if(result[0].count === 0) {
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
        .catch((error) => reject(error));
    });
  }

  // 송신탐지내역 테이블 데이터 삭제
  getUpdateUpLoad(id:any) {
    const query = `update leakedprintingfiles set upload_state = 1 WHERE id = ${id}`;

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

  // 송신탐지내역 테이블 데이터 삭제
  postRemoveData(body:string[]) {
    // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
    const idString = body.map((id) => `'${id}'`).join(", ");
    const query = `DELETE FROM leakedprintingfiles WHERE id IN (${idString})`;

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

  // DummyData 생성
  async getDummyData(count:any) {
    const date = new Date();
    let queryDay:number;
    let queryMonth:number;
    let queryDayStr:string;
    let queryMonthStr:string;
    let queryYearStr:string;
    let agentIp;
    let proc_name;
    
    for(let i=0; i < count; i++) {
      if(i%3 === 0) {
        agentIp = '10.10.10.157'
        proc_name = 'proc_name1'
      } else if(i%3 === 1) {
        agentIp = '192.168.1.55'
        proc_name = 'proc_name2'
      } else {
        agentIp = '10.10.10.127'
        proc_name = 'proc_name3'
      }

      // 날짜 계산
      date.setDate(date.getDate() - 1);
      if(date.getDate() === 0) date.setDate(0);

      queryDay = date.getDate();
      queryMonth = date.getMonth() + 1;
      queryYearStr = date.getFullYear().toString();

      if(queryDay < 10) {
        queryDayStr = '0' + queryDay;
      } else {
        queryDayStr = queryDay.toString();
      }

      if(queryMonth < 10) {
        queryMonthStr = '0' + queryMonth;
      } else {
        queryMonthStr = queryMonth.toString();
      }

      const getTime = generateRandomDateTime();      
      
      const query = `insert into	leakedprintingfiles (
        time,
        pc_guid,
      pc_name,
      proc_name,
      proc_id,
      latest_agent_ip,
      printer,
      doc_owner,
      doc_name,
      spl_file,
      file_size,
      doc_pages,
      upload_state)
    values (
    '${getTime}',
    'PCGUID${i+1}',
    'PCname${i+1}',
    '${proc_name}',
    '2684',
    '${agentIp}',
    'Samsung X3220NR',
    'USER',
    '퇴직원.pdf',
    'DESKTOP-O14QCIB++2022-08-31 10.00.34++00007.spl',
    '452823',
    '2',
    '111');`;
  
      try {
        const result = await new Promise((resolve, reject) => {
          connection.query(query, (error, result) => {
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
}

export default PrintService;
