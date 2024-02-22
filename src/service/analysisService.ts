import { IpRange } from "../interface/interface";
import connection from "../db/db";

class AnalysisService {
  settingDateAndRange(
    startDate: any,
    endDate: any,
  ): Promise<any> {
    const tables = ['leakednetworkfiles','leakedmediafiles','leakedoutlookfiles','leakedprintingfiles'];
    // startDate와 endDate가 주어졌는지 확인
    if (!startDate || !endDate) {
      throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
    }
    const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;
    const promises = tables.map(data => {
      return new Promise<void>((innerResolve, innerReject) => {
        const query = `select * from ${data} where (${dayOption})`;
        connection.query(query, (error, result) => {
          if (error) {
            innerReject(error);
          } else {
            innerResolve(result);
          }
        });
      })
    });

    return new Promise((resolve, reject) => {
      Promise.all(promises)
      .then((values) => {
        resolve(values);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }
}
export default AnalysisService;
