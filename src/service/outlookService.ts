import { IpRange } from "../interface/interface";
import connection from "../db/db";

class OutlookService {
  private query1!: number;
  private query2!: number;

  private columnAlias:any = {
    // alias    table명
    'id' : 'id',                    // 0
    'Time' : 'time',                // 1
    'PcName' : 'pcname',            // 2
    'Agent_ip' : 'agent_ip',        // 3
    'Process' : 'process',          // 4
    'PIDS' : 'pid',                 // 5
    'Mail_Subjects' : 'subject',    // 6
    'Sender' : 'sender',            // 7
    'Receiver' : 'receiver',        // 8
    'AttachedFiles' : 'attachment', // 9
    'CopiedFiles' : 'asked_file',   // 10
    'Downloading' : 'saved_file',   // 11
    'FileSizes' : 'file_size',      // 12
    'Keywords' : 'keywords',        // 13
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
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as alloutlooks FROM outlookpstviewer WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
      const query3 = `SELECT COUNT(*) as beforeoutlooks FROM outlookpstviewer WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].alloutlooks;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforeoutlooks;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            alloutlooks: this.query1,
            beforeoutlooks:
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

  getApiData(page: any, pageSize: any,sorting:any,desc:any,category:any,search:any, ipRanges: IpRange[]): Promise<any> {
    let queryPage:number=0;
    let queryPageSize:number=0;
    let querySorting:string=sorting === '' ? 'time' : sorting;
    let queryDesc:string=desc === 'false' ? 'asc' : 'desc';
    let whereClause = '';
    const aliasKey = Object.keys(this.columnAlias);
    const convertColumns = category !== '' && this.columnAlias[category];

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
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    if(search !== '') {
      whereClause = `where ${convertColumns} like ? AND (${ipConditions})`;
    } else {
      whereClause = `where ${ipConditions}`;
    }

    return new Promise((resolve, reject) => {
      const query =
        `select id, time as ${aliasKey[1]}, pcname as ${aliasKey[2]}, agent_ip as ${aliasKey[3]}, process as ${aliasKey[4]}, 
        pid as ${aliasKey[5]}, subject as ${aliasKey[6]}, sender as ${aliasKey[7]}, receiver as ${aliasKey[8]}, 
        attachment as ${aliasKey[9]}, asked_file as ${aliasKey[10]}, saved_file as ${aliasKey[11]}, 
        file_size as ${aliasKey[12]}, keywords as ${aliasKey[13]} ` +
        "from outlookpstviewer " +
         whereClause +
        ' order by '+ querySorting + ' ' + queryDesc + ' ' +
        'LIMIT ' + queryPageSize + ' offset ' + queryPage*queryPageSize;

      const query2 = "select count(*) as count from outlookpstviewer " + whereClause;
      const whereQuery = '%' + search + '%';

      console.log('query : ', query);
      

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query,whereQuery, (error, result) => {

            console.log('result : ', result);
            

            // 검색 결과가 없을 경우의 처리
            if(result.length === 0) {
              result[0] = aliasKey.reduce((obj:any, key:any) => {
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
  postRemoveData(body:string[]) {
    // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
    const idString = body.map((id) => `'${id}'`).join(", ");
    const query = `DELETE FROM outlookpstviewer WHERE id IN (${idString})`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.log("삭제하다가 사고남");
          reject(error);
        } else {
          console.log("삭제 성공");
          resolve(result);
          console.log('result : ', result);          
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
    let process;
    
    for(let i=0; i < count; i++) {
      if(i%3 === 0) {
        agentIp = '10.10.10.157'
        process = 'process1'
      } else if(i%3 === 1) {
        agentIp = '192.168.1.54'
        process = 'process2'
      } else {
        agentIp = '10.10.10.126'
        process = 'process3'
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
      
      const query = `insert into outlookpstviewer (
        time,
        pcname,
        process,
        pid,
        agent_ip,
        subject,
        sender,
        receiver,
        attachment,
        saved_file,
        file_size,
        keywords,
        down_state,
        isprinted,
        asked_file)
      values 
      (now(),
      'PCname${i+1}',
      '${process}',
      '23564',
      '${agentIp}',
      'FW: F5 웹방화벽 장애 원인분석 및 조치결과 보고서',
      'smlee@stemsoft.co.kr',
      'smlee@stemsoft.co.kr;',
      'image001.png, (220721) F5 웹방화벽 장애 원인분석 및 조치결과 보고서.docx',
      'DESKTOP-O14QCIB++2022-08-17 09.38.00++UP++(220721) F5 웹방화벽 장애 원인분석 및 조치결과 보고서.docx',
      '39630',
      'Keyword${i+1}',
      '111',
      '0',
      '5');`;
  
      try {
        const result = await new Promise((resolve, reject) => {
          connection.query(query, (error, result) => {
            if (error) {
              console.log("getDummyData 에러 발생");
              reject(error);
            } else {
              console.log("데이터 삽입 성공");
              resolve(result);
              // console.log('result : ', result);          
            }
          });
        });
  
        console.log(`데이터 삽입 ${i+1}번째 성공`);
      } catch (error) {
        console.log(`데이터 삽입 ${i+1}번째 실패: ${error}`);
      }
    }
  }
}

export default OutlookService;