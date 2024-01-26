import { IpRange } from "../interface/interface";
import connection from "../db/db";

class PieChartService {

  getPieDataToday(id:string, day:any, ipRanges: IpRange[]): Promise<any> {
    //매개변수를 Table 명을 정하는 값으로 받을꺼임
    let table:string;
    let dayOption:string;

    if(id === 'Network'){
      table = 'detectfiles';
    }else if(id === 'Media'){
      table = 'detectmediafiles';
    }else if(id === 'Outlook'){
      table = 'outlookpstviewer';
    }else {
      table = 'detectprinteddocuments';
    }

    if(day === 'day'){
      dayOption = 'DATE(time) = CURDATE()';
    }else if(day === 'week'){
      dayOption = 'time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time < NOW()';
    }else {
      dayOption = 'time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time < NOW()';
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    let queryNet1 =
      `select process, count(process) as count from ${table} where ${dayOption} AND (${ipConditions}) group by process order by count(process) desc limit 4`;
    let queryNet2 =
      `select count(*) as totalCount from ${table} where ${dayOption} AND (${ipConditions})`;

      return new Promise<any>((resolve, reject) => {
      connection.query(queryNet1, (error, result1) => {
        if (error) {
          reject(error);
        } else {
          connection.query(queryNet2, (error2, result2) => {
            if (error2) {
              reject(error2);
            }
            const data = result1.map((item: any) => {
              const count = (item.count / result2[0].totalCount) * 100;

              return {
                process: item.process,
                count: item.count,
                hcount: parseFloat(count.toFixed(1))
              };
            });
            data.sort((a:any, b:any) => b.count - a.count);
            resolve(data);
          });
        }
      });
    });
  }
}

export default PieChartService;
