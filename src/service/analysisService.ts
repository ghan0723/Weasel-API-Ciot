import { IpRange } from "../interface/interface";
import connection from "../db/db";
import Average from "../analysis/average";

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
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
    } else if (diffInDays < febDays) {
      return `${Math.floor(diffInDays / 7)} week${
        Math.floor(diffInDays / 7) > 1 ? "s" : ""
      }`;
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)} month${
        Math.floor(diffInDays / 30) > 1 ? "s" : ""
      }`;
    } else {
      return `${Math.floor(diffInDays / 365)} year${
        Math.floor(diffInDays / 365) > 1 ? "s" : ""
      }`;
    }
  }

  scoringRiskPoint(
    sortedEventByPc: { [pcGuid: string]: number },
    sortedFileSizeByPc: { [pcGuid: string]: number },
    sortedPatternsByPc?: { [pcGuid: string]: number }
  ): { pcGuid: string, sum: number, text: string }[] {
    // PC별 정보를 저장할 객체 초기화
    const riskPointsByPc: { [pc_guid: string]: { sum: number, event: number, file_size: number, pattern:number } } = {};
  
    // 각 PC별로 파일 유출 빈도 점수와 파일 크기 점수를 가져와서 리스크 포인트 계산
    Object.keys(sortedEventByPc).forEach((pcGuid) => {
      const eventPoint = sortedEventByPc[pcGuid] || 0;
      const fileSizePoint = sortedFileSizeByPc[pcGuid] || 0;
      const patternPoint = sortedPatternsByPc !== undefined && sortedPatternsByPc[pcGuid] || 0;
  
      // 리스크 포인트 계산
      const sum = eventPoint + fileSizePoint * 2 + patternPoint;
  
      // PC별 정보 저장
      riskPointsByPc[pcGuid] = { sum, event: eventPoint, file_size: fileSizePoint, pattern:patternPoint};
    });
  
    // 결과를 담을 배열 초기화
    let riskPointsArray:any[] = [];
  
    // 객체를 배열로 변환하고 원하는 형식의 문자열을 추가하여 결과 배열에 추가
    Object.keys(riskPointsByPc).forEach((pcGuid) => {
      const { sum, event, file_size, pattern } = riskPointsByPc[pcGuid];
      let text = '';
      let progress = (sum / Math.max(...Object.values(riskPointsByPc).map(({ sum }) => sum))) * 100; // progress 계산
      
      // 특정 조건에 따라 텍스트 추가
      if (event >= 80) {
        text += '빈도수는 위험';
      } else if (event >= 40){
        text += '빈도수는 중간';
      } else if(event >= 0){
        text += '빈도수는 기본';
      }

      if (file_size >= 80) {
        text += ', 파일 사이즈는 위험';
      } else if (file_size >= 40){
        text += ', 파일 사이즈는 중간';
      } else if (file_size >= 0){
        text += ', 파일 사이즈는 기본';
      }
      
      // 결과 배열에 객체 추가
      riskPointsArray.push({ pcGuid, status: sum, text, progress });
    });

    // status가 높은 순서대로 정렬
    riskPointsArray.sort((a, b) => b.sum - a.sum);

    console.log("riskPointsArray : ", riskPointsArray);

    // 결과 반환
    return riskPointsArray;
  }

  analyzePatterns(detectFiles: any, keywords : any): { [pcGuid: string]: number } {
    const patternsResult: { [pcGuid: string]: number  } = {};
    const average: Average = new Average();
    const keywordsList:any = {};
    const patternsList:any = {};

    // 키워드/건수 구분
    Object.keys(keywords).map(data => {
      // 키워드
      if(keywords[data]?.check === true) {
        keywordsList[data] = keywords[data];
      } else {
        // 건수
        patternsList[data] = keywords[data];
      }
    });    

    // DB Sort
    const patternsDB = average.analyzePatternsDBSort(detectFiles,keywords);

    // 아무 패턴도 없는 것에 대한 scoring 및 제거
    Object.keys(patternsDB).map(data => {
      if(patternsDB[data] === '') {
        patternsResult[data] = 0;
        delete patternsDB[data];
      }
    });

    // 키워드/건수에 대한 scoring
    const keywordsScoring = average.analyzeKeywordsListScoring(patternsDB,keywordsList);
    const patternsScoring = average.analyzePatternsListScoring(patternsDB,patternsList);

    Object.keys(keywordsScoring).map(guid => {
      patternsResult[guid] = (keywordsScoring[guid] + patternsScoring[guid]);
    });

    return patternsResult;
  }


}
export default AnalysisService;
