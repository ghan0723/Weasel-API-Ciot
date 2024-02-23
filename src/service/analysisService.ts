import { IpRange } from "../interface/interface";
import connection from "../db/db";

class AnalysisService {
  settingDateAndRange(startDate: any, endDate: any): Promise<any> {
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

  formatPeriod(startDateStr: string, endDateStr: string): string {
    // 문자열을 Date 객체로 변환
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = Math.round(diffInMs / msPerDay);

    // 윤년 계산
    const isLeapYear = (year: number): boolean => 
        year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

    // 2월의 일수 계산
    const febDays = isLeapYear(startDate.getFullYear()) ? 29 : 28;

    // 주, 달, 년 계산
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInDays < febDays) {
        return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    } else if (diffInDays < 365) {
        return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''}`;
    } else {
        return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
    }
}
}
export default AnalysisService;
