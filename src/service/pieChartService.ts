import { IpRange } from "../interface/interface";
import connection from "../db/db";

class PieChartService {

  getPieDataToday(id:string, day:any, ipRanges: IpRange[]): Promise<any> {
    //매개변수를 Table 명을 정하는 값으로 받을꺼임
    let table:string;
    let dayOption:string;

    if(id === 'Network'){
      table = 'leakednetworkfiles';
    }else if(id === 'Media'){
      table = 'leakedmediafiles';
    }else if(id === 'Outlook'){
      table = 'leakedoutlookfiles';
    }else {
      table = 'leakedprintingfiles';
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
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    let queryNet1 =
      `select proc_name, count(proc_name) as count from ${table} where ${dayOption} AND (${ipConditions}) group by proc_name order by count(proc_name) desc limit 4`;
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
                proc_name: item.proc_name,
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
