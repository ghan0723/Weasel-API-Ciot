import connection from "../db/db";
import { IpRange } from "../interface/interface";

class ComplexService {
  getkData(props: any, select:any, ipRanges: IpRange[]): Promise<any> {
    let table: string;
    let dayOption: string;

    if (props === "network") {
      table = "detectfiles";
    } else if (props === "media") {
      table = "detectmediafiles";
    } else if (props === "outlook") {
      table = "outlookpstviewer";
    } else {
      table = "detectprinteddocuments";
    }

    if (select === "day") {
        dayOption = "DATE(time) = CURDATE()";
      } else if (select === "week") {
        dayOption =
          "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
      } else {
        dayOption =
          "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
      }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");
    const query = `select pcname, saved_file, agent_ip from ${table} where (${dayOption}) AND (${ipConditions}) order by time desc limit 5;`;
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

export default ComplexService;
