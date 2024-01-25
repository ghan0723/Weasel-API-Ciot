import { IpRange } from "../interface/interface";
import connection from "../db/db";

class BarService {
  getBarData(props: any, param: any, ipRanges: IpRange[]): Promise<any> {
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

    if (param === "day") {
      dayOption = "DATE(time) = CURDATE()";
    } else if (param === "week") {
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

    let query = `select agent_ip, count(distinct id) as totalCount from ${table} where (${dayOption}) AND (${ipConditions}) group by agent_ip order by totalCount desc limit 5`;

    return new Promise<any>((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // 가공된 데이터 생성
          const data = result.map((item: any) => ({
            agentip: item.agent_ip,
            totalCount: item.totalCount,
          }));
          // 최종 결과물 반환
          resolve({
            table: props,
            data: data,
          });
        }
      });
    });
  }
}

export default BarService;
