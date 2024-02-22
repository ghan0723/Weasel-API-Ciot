import { IpRange } from "../interface/interface";
import connection from "../db/db";

class AnalysisService {
  settingDateAndRange(
    startDate: any,
    endDate: any,
  ): Promise<any> {
    // startDate와 endDate가 주어졌는지 확인
    if (!startDate || !endDate) {
      throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
    }
    const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;

    const query = `select * from leakednetworkfiles where (${dayOption})`;
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
export default AnalysisService;
