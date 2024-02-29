import connection from "../db/db";
import Average from "../analysis/average";

class AnalysisService {
  settingDateAndRange(startDate: any, endDate: any, pcGuid?: any): Promise<any> {
    // startDate와 endDate가 주어졌는지 확인
    if (!startDate || !endDate) {
      throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
    }
    const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;

    let query = `select * from leakednetworkfiles where (${dayOption})`;
    if(pcGuid !== undefined) {
      query = `select * from leakednetworkfiles where (${dayOption}) AND pc_guid = '${pcGuid}'`
    }
    
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

  getAgentInfo(startDate: any, endDate: any): Promise<any>{
    // startDate와 endDate가 주어졌는지 확인
    if (!startDate || !endDate) {
      throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
    }
    const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;


    const query = `SELECT * FROM agentinfo WHERE pc_guid IN (SELECT DISTINCT pc_guid FROM leakednetworkfiles WHERE (${dayOption}))`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    })
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
    agentinfo: { [pcGuid: string]: { pcName: string, latestAgentIp: string } },
    sortedPatternsByPc?: { [pcGuid: string]: {score:number, patternLevel:number} },
  ) {
    
    // PC별 정보를 저장할 객체 초기화
    const riskPointsByPc: { [pc_guid: string]: { sum: number, event: number, file_size: number, pattern:{score:number, patternLevel:number} } } = {};
  
    // 각 PC별로 파일 유출 빈도 점수와 파일 크기 점수를 가져와서 리스크 포인트 계산
    Object.keys(sortedEventByPc).forEach((pcGuid) => {
      let sum = 0;
      const eventPoint = sortedEventByPc[pcGuid] || 0;
      const fileSizePoint = sortedFileSizeByPc[pcGuid] || 0;
      const patternPoint:any = sortedPatternsByPc !== undefined && sortedPatternsByPc[pcGuid] || 0;
  
      if(patternPoint !== 0) {
        // 리스크 포인트 계산
        sum = eventPoint + fileSizePoint * 2 + patternPoint.score;
      } else {
        sum = eventPoint + fileSizePoint * 2;
      }
  
      // PC별 정보 저장
      riskPointsByPc[pcGuid] = { sum, event: eventPoint, file_size: fileSizePoint, pattern:patternPoint};
    });
  
    // 결과를 담을 배열 초기화
    let riskPointsArray:any[] = [];
  
    // 객체를 배열로 변환하고 원하는 형식의 문자열을 추가하여 결과 배열에 추가
    Object.keys(riskPointsByPc).forEach((pcGuid) => {
      const { sum, event, file_size, pattern } = riskPointsByPc[pcGuid];
      let text = '';
      let level = 0;
      let eventLevel = 0;
      let sizeLevel = 0;
      let patLevel = 0;
      let progress = (sum / Math.max(...Object.values(riskPointsByPc).map(({ sum }) => sum))) * 100; // progress 계산
      // 특정 조건에 따라 텍스트 추가
      if (event >= 80) {
        text += '유출 빈도:매우 심각';
        eventLevel += 5; 
      } else if (event >= 60){
        text += '유출 빈도:심각';
        eventLevel += 4;
      } else if(event >= 40){
        text += '유출 빈도:경계';
        eventLevel += 3;
      } else if (event >= 20){
        text += '유출 빈도:주의';
        eventLevel += 2;
      } else if (event >= 0){
        text += '유출 빈도:관심';
        eventLevel += 1;
      }

      if (file_size >= 160) {
        text += ', 유출 용량:매우 심각';
        sizeLevel += 5;
      } else if (file_size >= 120){
        text += ', 유출 용량:심각';
        sizeLevel += 4;
      } else if(file_size >= 80){
        text += ', 유출 용량:경계';
        sizeLevel += 3;
      } else if (file_size >= 40){
        text += ', 유출 용량:주의';
        sizeLevel += 2;
      } else if (file_size >= 0){
        text += ', 유출 용량:관심';
        sizeLevel += 1;
      }

      if(pattern?.patternLevel >= 5) {
        text += ', 패턴/키워드:매우 심각';
        patLevel += 5;
      } else if(pattern?.patternLevel >= 4) {
        text += ', 패턴/키워드:심각';
        patLevel += 4;
      } else if(pattern?.patternLevel >= 3) {
        text += ', 패턴/키워드:경계';
        patLevel += 3;
      } else if(pattern?.patternLevel >= 2) {
        text += ', 패턴/키워드:주의';
        patLevel += 2;
      } else if(pattern?.patternLevel >= 1) {
        text += ', 패턴/키워드:관심';
        patLevel += 1;
      }

      // pcName 및 latestAgentIp 가져오기
      const { pcName, latestAgentIp } = agentinfo[pcGuid];
      const weightedAverageGroup = this.calculateWeightedAverage({eventLevel, sizeLevel, patLevel});
      
      // 결과 배열에 객체 추가
      riskPointsArray.push({ pcGuid, level:weightedAverageGroup , pcName:`${pcName}(${latestAgentIp})`,  status: sum, text, progress});
    });

    // status가 동일한 경우에는 이벤트 빈도수를 기준으로 내림차순으로 정렬
    riskPointsArray.sort((a, b) => {
      if (b.level !== a.level) {
        return b.level - a.level; // level이 다를 때는 level로 정렬
      } else if (b.status !== a.status) {
        return b.status - a.status; // level이 같고 status가 다를 때는 status로 정렬
      } else {
        return b.event - a.event; // level과 status가 같을 때는 이벤트 빈도수로 정렬
      }
    });

    // 결과 반환
    return riskPointsArray;
  }

  analyzePatterns(detectFiles: any, keywords : any): { [pcGuid: string]: {score:number, patternLevel:number} } {
    const patternsResult: { [pcGuid: string]: {score:number, patternLevel:number}  } = {};
    const average: Average = new Average();
    const keywordsList:any = {};
    const patternsList:any = {};

    // 패턴/키워드 구분
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
    const patternsDB = average.analyzePatternsDBSort(detectFiles);

    // 아무 패턴도 없는 것에 대한 scoring 및 제거
    Object.keys(patternsDB).map(data => {
      patternsResult[data] = {score:0, patternLevel:0};
      if(patternsDB[data] === '') {
        delete patternsDB[data];
      }
    });

    // 패턴/키워드에 대한 scoring
    const keywordsScoring = average.analyzeKeywordsListScoring(patternsDB,keywordsList);
    const patternsScoring = average.analyzePatternsListScoring(patternsDB,patternsList);

    Object.keys(keywordsScoring).map(guid => {
      patternsResult[guid].score = (keywordsScoring[guid].score + patternsScoring[guid].score);
      if(keywordsScoring[guid].patternLevel >= patternsScoring[guid].patternLevel) {
        patternsResult[guid].patternLevel = keywordsScoring[guid].patternLevel;
      } else {
        patternsResult[guid].patternLevel = patternsScoring[guid].patternLevel;
      }
    });

    return patternsResult;
  }

  analyzeDetailPatterns(detectFiles: any, pc_guid:any):any {
    const average: Average = new Average();
    // DB Sort
    const patternsDB = average.analyzePatternsDBSort(detectFiles);
    const result:any = {};

    const patternObject:any = [];
    const patterns = patternsDB[pc_guid].split(', '); // 문자열을 ', '로 분리하여 배열로 변환
    let   totalCount = 0;
  
    // 들어온 데이터를 객체 배열로 형성
    patterns.forEach(pattern => {
      if(pattern.includes(':')) {
        const [key, value] = pattern.split(':'); // 각 패턴을 ':'로 분리
        // 키는 공백 제거 후 사용, 값은 정수로 변환하여 할당
        patternObject.push({[key] : parseInt(value, 10)});
        totalCount += parseInt(value, 10);
      }
    });

    // 숫자가 높은 것부터 정렬
    patternObject.sort((a:any, b:any) => {
      const aValue:any = Object.values(a); // a 객체의 첫 번째 값
      const bValue:any = Object.values(b); // b 객체의 첫 번째 값
      return bValue - aValue; // 내림차순 정렬
    });

    // 각 객체의 값을 천 단위 구분 기호를 포함하는 문자열로 변환
    const formattedPatternObject = patternObject.map((obj:any) => {
      const key:any = Object.keys(obj)[0]; // 객체의 키 추출
      const value:any = Object.values(obj)[0]; // 객체의 값 추출
      const formattedValue = value.toLocaleString(); // 값에 천 단위 구분 기호 추가
      return { [key]: formattedValue }; // 변환된 값으로 새 객체 생성
    });

    result['keywords'] = formattedPatternObject;
    result['totalCount'] = totalCount.toLocaleString();
    
    return result;
  }

  transformAgentInfo(agentInfoArray: any[]): { [pcGuid: string]: { pcName: string, latestAgentIp: string } } {
    const transformedAgentInfo: { [pcGuid: string]: { pcName: string, latestAgentIp: string } } = {};
  
    for (const rowData of agentInfoArray) {
      const pcGuid: string = rowData.pc_guid;
      const pcName: string = rowData.pc_name;
      const latestAgentIp: string = rowData.latest_agent_ip;
  
      transformedAgentInfo[pcGuid] = { pcName, latestAgentIp };
    }
  
    return transformedAgentInfo;
  }

  riskScoring(startDate:any, endDate:any, keywords:any):Promise<any> {
    let scoringPoint:any;
    const dateRange = this.formatPeriod(startDate, endDate);
    const average:Average = new Average();

    // 정규식을 사용하여 숫자 값을 추출합니다.
    const matchResult = dateRange.match(/\d+/);

    return new Promise((resolve, reject) => {
      if (matchResult) {
        const numericValue = parseInt(matchResult[0]);
        let patternsResult:{ [pcGuid: string]: {score:number, patternLevel:number} } = {};
    
        this.settingDateAndRange(startDate, endDate)
        .then((result) => {
          this.getAgentInfo(startDate, endDate)
          .then((result2) => {
              const agnetInfo = this.transformAgentInfo(result2);
              // pattern
              if(Object.keys(keywords).length !== 0) {
                patternsResult = this.analyzePatterns(result,keywords);
              }
    
              if(dateRange.includes('week')){
                const averageResult = average.analyzeEventsByWeek(result);
                const averageResult2 = average.analyzeFileSizeByWeek(result); 
                scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
              } else if(dateRange.includes('month')){
                const averageResult = average.analyzeEventsByMonth(result, numericValue);
                const averageResult2 = average.analyzeFileSizeByMonth(result, numericValue);
                scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
              } else if(dateRange.includes('year')){
                const averageResult = average.analyzeEventsByYear(result, numericValue);
                const averageResult2 = average.analyzeFileSizeByMonth(result, 12);
                scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo,patternsResult);
              }
  
              resolve(scoringPoint);
          })
          .catch((error) => {
            reject({
              status : 400,
              error : error
                  });
          })
        });
      } else {
        // 숫자 값을 추출할 수 없는 경우에 대한 처리
        reject({
          status : 500,
          error : "Unable to extract numeric value from dateRange"
        });
      }
    });
  }

  calculateWeightedAverage(group: { [key: string]: number }): number {
    // 평균 계산
    const values = Object.values(group);
    const average = values.reduce((acc, curr) => acc + curr, 0) / values.length;
    
    // 최대값 찾기
    const maxValue = Math.max(...values);
    
    // 최대값과 나머지 값들의 차이를 바탕으로 가중치 계산
    const weight = values.filter(value => value !== maxValue)
                         .reduce((acc, curr) => acc + (maxValue - curr), 0) / (values.length - 1);
    
    // 가중치가 너무 크면 조정
    const adjustedWeight = Math.min(weight, maxValue / 2) / 10;
    
    // 가중치 적용된 평균 계산
    let weightedAverage = average + adjustedWeight;
    
    // 2번 집단과의 비교를 위한 조건 추가
    // 이 부분은 문제의 요구 사항에 따라 추가적인 조정이 필요할 수 있습니다.
    
    // 결과 반올림
    return Math.round(weightedAverage);
}


}
export default AnalysisService;
