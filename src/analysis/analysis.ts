import { IpRange } from "../interface/interface";
import connection from "../db/db";

class Analysis {
  settingDateAndRange(
    startDate: any,
    endDate: any,
    ipRanges: IpRange[]
  ): Promise<any> {
    // startDate와 endDate가 주어졌는지 확인
    if (!startDate || !endDate || !ipRanges) {
      throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
    }

    const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    const query = `select * from leakednetworkfiles where (${dayOption}) AND (${ipConditions})`;
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
export default Analysis;
