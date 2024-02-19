import connection from "../db/db";
import { IpRange } from "../interface/interface";

class ComplexService {
  getData(props: any, select: any, ipRanges: IpRange[]): Promise<any> {
    let table: string;
    let dayOption: string;
    let columns: string;

    if (props === "network") {
      table = "leakednetworkfiles";
      columns = "proc_name ,url";
    } else if (props === "media") {
      table = "leakedmediafiles";
      columns = "media_type, file";
    } else if (props === "outlook") {
      table = "leakedoutlookfiles";
      columns = "proc_name, sender";
    } else {
      table = "leakedprintingfiles";
      columns = "printer, document";
    }

    if (select === "day") {
      dayOption = "DATE(time) = CURDATE()";
    } else if (select === "week") {
      dayOption = "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
    } else {
      dayOption = "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");
    const query = `select pc_name, ${columns} from ${table} where (${dayOption}) AND (${ipConditions}) order by time desc limit 5;`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          const keys = Array.from(new Set(result.flatMap((item:any) => Object.keys(item))));
          resolve({
            table:props,
            data:result,
            key:keys
          });
        }
      });
    });
  }

  getAllData():Promise<any> {
    const query = "select * from leakednetworkfiles";
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }
}

export default ComplexService;
