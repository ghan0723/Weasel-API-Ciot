"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const average_1 = __importDefault(require("../analysis/average"));
class AnalysisService {
    settingDateAndRange(startDate, endDate, pcGuid) {
        // startDate와 endDate가 주어졌는지 확인
        if (!startDate || !endDate) {
            throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
        }
        const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;
        let query = `select * from leakednetworkfiles where (${dayOption})`;
        if (pcGuid !== undefined) {
            query = `select * from leakednetworkfiles where (${dayOption}) AND pc_guid = '${pcGuid}'`;
        }
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getAgentInfo(startDate, endDate) {
        // startDate와 endDate가 주어졌는지 확인
        if (!startDate || !endDate) {
            throw new Error("startDate와 endDate와 ipRanges는 필수 매개변수입니다.");
        }
        const dayOption = `time >= '${startDate}' AND time <= '${endDate}'`;
        const query = `SELECT * FROM agentinfo WHERE pc_guid IN (SELECT DISTINCT pc_guid FROM leakednetworkfiles WHERE (${dayOption}))`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    formatPeriod(startDateStr, endDateStr) {
        // 문자열을 Date 객체로 변환
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffInMs = endDate.getTime() - startDate.getTime();
        const diffInDays = Math.round(diffInMs / msPerDay);
        // 윤년 계산
        const isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        // 2월의 일수 계산
        const febDays = isLeapYear(startDate.getFullYear()) ? 29 : 28;
        // 주, 달, 년 계산
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
        }
        else if (diffInDays < febDays) {
            return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""}`;
        }
        else if (diffInDays < 365) {
            return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? "s" : ""}`;
        }
        else {
            return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? "s" : ""}`;
        }
    }
    scoringRiskPoint(sortedEventByPc, sortedFileSizeByPc, agentinfo, sortedPatternsByPc) {
        // PC별 정보를 저장할 객체 초기화
        const riskPointsByPc = {};
        // 각 PC별로 파일 유출 빈도 점수와 파일 크기 점수를 가져와서 리스크 포인트 계산
        Object.keys(sortedEventByPc).forEach((pcGuid) => {
            let sum = 0;
            const eventPoint = sortedEventByPc[pcGuid] || 0;
            const fileSizePoint = sortedFileSizeByPc[pcGuid] || 0;
            const patternPoint = sortedPatternsByPc !== undefined && sortedPatternsByPc[pcGuid] || 0;
            if (patternPoint !== 0) {
                // 리스크 포인트 계산
                sum = eventPoint + fileSizePoint * 2 + patternPoint.score;
            }
            else {
                sum = eventPoint + fileSizePoint * 2;
            }
            // PC별 정보 저장
            riskPointsByPc[pcGuid] = { sum, event: eventPoint, file_size: fileSizePoint, pattern: patternPoint };
        });
        // 결과를 담을 배열 초기화
        let riskPointsArray = [];
        // 객체를 배열로 변환하고 원하는 형식의 문자열을 추가하여 결과 배열에 추가
        Object.keys(riskPointsByPc).forEach((pcGuid) => {
            const { sum, event, file_size, pattern } = riskPointsByPc[pcGuid];
            let text = '';
            let level = 0;
            let progress = (sum / Math.max(...Object.values(riskPointsByPc).map(({ sum }) => sum))) * 100; // progress 계산
            // 특정 조건에 따라 텍스트 추가
            if (event >= 80) {
                text += '빈도수:매우 위험';
                level = Math.max(level, 5); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (event >= 60) {
                text += '빈도수:위험';
                level = Math.max(level, 4); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (event >= 40) {
                text += '빈도수:경고';
                level = Math.max(level, 3); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (event >= 20) {
                text += '빈도수:주의';
                level = Math.max(level, 2); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (event >= 0) {
                text += '빈도수:관심';
                level = Math.max(level, 1); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            if (file_size >= 160) {
                text += ', 파일 사이즈:매우 위험';
                level = Math.max(level, 5); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (file_size >= 120) {
                text += ', 파일 사이즈:위험';
                level = Math.max(level, 4); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (file_size >= 80) {
                text += ', 파일 사이즈:경고';
                level = Math.max(level, 3); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (file_size >= 40) {
                text += ', 파일 사이즈:주의';
                level = Math.max(level, 2); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (file_size >= 0) {
                text += ', 파일 사이즈:관심';
                level = Math.max(level, 1); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            if (pattern.patternLevel == 5) {
                text += ', 패턴/키워드:매우 심각';
                level = Math.max(level, 5); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (pattern.patternLevel == 4) {
                text += ', 패턴/키워드:심각';
                level = Math.max(level, 4); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (pattern.patternLevel == 3) {
                text += ', 패턴/키워드:경계';
                level = Math.max(level, 3); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (pattern.patternLevel == 2) {
                text += ', 패턴/키워드:주의';
                level = Math.max(level, 2); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            else if (pattern.patternLevel == 1) {
                text += ', 패턴/키워드:관심';
                level = Math.max(level, 1); // 현재 레벨과 비교하여 더 높은 레벨 선택
            }
            // pcName 및 latestAgentIp 가져오기
            const { pcName, latestAgentIp } = agentinfo[pcGuid];
            // 결과 배열에 객체 추가
            riskPointsArray.push({ pcGuid, level, pcName: `${pcName}(${latestAgentIp})`, status: sum, text, progress });
        });
        // status가 동일한 경우에는 이벤트 빈도수를 기준으로 내림차순으로 정렬
        riskPointsArray.sort((a, b) => {
            if (b.status !== a.status) {
                return b.status - a.status; // status가 다를 때는 status로 정렬
            }
            else {
                return b.event - a.event; // status가 동일할 때는 이벤트 빈도수로 정렬
            }
        });
        // 결과 반환
        return riskPointsArray;
    }
    analyzePatterns(detectFiles, keywords) {
        const patternsResult = {};
        const average = new average_1.default();
        const keywordsList = {};
        const patternsList = {};
        // 패턴/키워드 구분
        Object.keys(keywords).map(data => {
            var _a;
            // 키워드
            if (((_a = keywords[data]) === null || _a === void 0 ? void 0 : _a.check) === true) {
                keywordsList[data] = keywords[data];
            }
            else {
                // 건수
                patternsList[data] = keywords[data];
            }
        });
        // DB Sort
        const patternsDB = average.analyzePatternsDBSort(detectFiles);
        // 아무 패턴도 없는 것에 대한 scoring 및 제거
        Object.keys(patternsDB).map(data => {
            patternsResult[data] = { score: 0, patternLevel: 0 };
            if (patternsDB[data] === '') {
                delete patternsDB[data];
            }
        });
        // 패턴/키워드에 대한 scoring
        const keywordsScoring = average.analyzeKeywordsListScoring(patternsDB, keywordsList);
        const patternsScoring = average.analyzePatternsListScoring(patternsDB, patternsList);
        Object.keys(keywordsScoring).map(guid => {
            patternsResult[guid].score = (keywordsScoring[guid].score + patternsScoring[guid].score);
            if (keywordsScoring[guid].patternLevel >= patternsScoring[guid].patternLevel) {
                patternsResult[guid].patternLevel = keywordsScoring[guid].patternLevel;
            }
            else {
                patternsResult[guid].patternLevel = patternsScoring[guid].patternLevel;
            }
        });
        return patternsResult;
    }
    analyzeDetailPatterns(detectFiles, pc_guid) {
        const average = new average_1.default();
        // DB Sort
        const patternsDB = average.analyzePatternsDBSort(detectFiles);
        const result = {};
        const patternObject = [];
        const patterns = patternsDB[pc_guid].split(', '); // 문자열을 ', '로 분리하여 배열로 변환
        let totalCount = 0;
        // 들어온 데이터를 객체 배열로 형성
        patterns.forEach(pattern => {
            if (pattern.includes(':')) {
                const [key, value] = pattern.split(':'); // 각 패턴을 ':'로 분리
                // 키는 공백 제거 후 사용, 값은 정수로 변환하여 할당
                patternObject.push({ [key]: parseInt(value, 10) });
                totalCount += parseInt(value, 10);
            }
        });
        // 숫자가 높은 것부터 정렬
        patternObject.sort((a, b) => {
            const aValue = Object.values(a); // a 객체의 첫 번째 값
            const bValue = Object.values(b); // b 객체의 첫 번째 값
            return bValue - aValue; // 내림차순 정렬
        });
        // 각 객체의 값을 천 단위 구분 기호를 포함하는 문자열로 변환
        const formattedPatternObject = patternObject.map((obj) => {
            const key = Object.keys(obj)[0]; // 객체의 키 추출
            const value = Object.values(obj)[0]; // 객체의 값 추출
            const formattedValue = value.toLocaleString(); // 값에 천 단위 구분 기호 추가
            return { [key]: formattedValue }; // 변환된 값으로 새 객체 생성
        });
        result['keywords'] = formattedPatternObject;
        result['totalCount'] = totalCount.toLocaleString();
        return result;
    }
    transformAgentInfo(agentInfoArray) {
        const transformedAgentInfo = {};
        for (const rowData of agentInfoArray) {
            const pcGuid = rowData.pc_guid;
            const pcName = rowData.pc_name;
            const latestAgentIp = rowData.latest_agent_ip;
            transformedAgentInfo[pcGuid] = { pcName, latestAgentIp };
        }
        return transformedAgentInfo;
    }
    riskScoring(startDate, endDate, keywords) {
        let scoringPoint;
        const dateRange = this.formatPeriod(startDate, endDate);
        const average = new average_1.default();
        // 정규식을 사용하여 숫자 값을 추출합니다.
        const matchResult = dateRange.match(/\d+/);
        return new Promise((resolve, reject) => {
            if (matchResult) {
                const numericValue = parseInt(matchResult[0]);
                let patternsResult = {};
                this.settingDateAndRange(startDate, endDate)
                    .then((result) => {
                    this.getAgentInfo(startDate, endDate)
                        .then((result2) => {
                        const agnetInfo = this.transformAgentInfo(result2);
                        // pattern
                        if (Object.keys(keywords).length !== 0) {
                            patternsResult = this.analyzePatterns(result, keywords);
                        }
                        if (dateRange.includes('week')) {
                            const averageResult = average.analyzeEventsByWeek(result);
                            const averageResult2 = average.analyzeFileSizeByWeek(result);
                            scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                        }
                        else if (dateRange.includes('month')) {
                            const averageResult = average.analyzeEventsByMonth(result, numericValue);
                            const averageResult2 = average.analyzeFileSizeByMonth(result, numericValue);
                            scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                        }
                        else if (dateRange.includes('year')) {
                            const averageResult = average.analyzeEventsByYear(result, numericValue);
                            const averageResult2 = average.analyzeFileSizeByMonth(result, 12);
                            scoringPoint = this.scoringRiskPoint(averageResult, averageResult2, agnetInfo, patternsResult);
                        }
                        resolve(scoringPoint);
                    })
                        .catch((error) => {
                        reject({
                            status: 400,
                            error: error
                        });
                    });
                });
            }
            else {
                // 숫자 값을 추출할 수 없는 경우에 대한 처리
                reject({
                    status: 500,
                    error: "Unable to extract numeric value from dateRange"
                });
            }
        });
    }
}
exports.default = AnalysisService;
