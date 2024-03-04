"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Average {
    analyzeLeaks(detectFiles) {
        // 24시간 배열을 0으로 초기화
        const leakEventsByAllHour = Array.from({ length: 24 }, (_, i) => ({ [i]: 0 })).reduce((acc, hourObj) => Object.assign(acc, hourObj), {});
        // 각 파일을 순회하면서 해당 시간의 카운트 증가
        detectFiles.forEach((file) => {
            const hour = new Date(file.time).getHours();
            leakEventsByAllHour[hour]++;
        });
        const leakEventsByHour = detectFiles.reduce((acc, file) => {
            const hour = new Date(file.time).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        const totalHours = Object.keys(leakEventsByHour).length;
        const totalEvents = Object.values(leakEventsByHour).reduce((sum, count) => sum + count, 0);
        const averageEventsPerHour = totalEvents / totalHours;
        const anomalyHours = Object.entries(leakEventsByHour)
            .filter(([hour, count]) => count > averageEventsPerHour * 2)
            .map(([hour]) => hour);
        return {
            leakEventsByAllHour,
            averageEventsPerHour,
            anomalyHours,
        };
    }
    analyzeEventsByWeek(detectFiles) {
        // PC 별로 유출 빈도 수를 counting 할 객체
        const eventByPc = {};
        // 배열을 확인하면서 pc 별 빈도수를 계산한다.
        detectFiles.forEach((file) => {
            const { pc_guid } = file;
            // 해당 PC의 빈도수를 증가시킨다.
            if (eventByPc[pc_guid]) {
                eventByPc[pc_guid]++;
            }
            else {
                eventByPc[pc_guid] = 1;
            }
        });
        // 결과에 맞게 점수를 부여한다.(주간 일때는 건당 2점)
        Object.keys(eventByPc).forEach((pcGuid, index) => {
            if (eventByPc[pcGuid] >= 50) {
                eventByPc[pcGuid] = 100;
            }
            else if (eventByPc[pcGuid] >= 40) {
                eventByPc[pcGuid] = 80;
            }
            else if (eventByPc[pcGuid] >= 20) {
                eventByPc[pcGuid] = 40;
            }
            else if (eventByPc[pcGuid] >= 10) {
                eventByPc[pcGuid] = 20;
            }
            else if (eventByPc[pcGuid] >= 5) {
                eventByPc[pcGuid] = 10;
            }
            else {
                eventByPc[pcGuid] = 0;
            }
        });
        // 점수를 기준으로 내림차순 정렬
        const sortedEventByPc = Object.fromEntries(Object.entries(eventByPc).sort(([, a], [, b]) => b - a));
        return sortedEventByPc;
    }
    analyzeEventsByMonth(detectFiles, count) {
        // PC 별로 유출 빈도 수를 counting 할 객체
        const eventByPc = {};
        // 배열을 확인하면서 pc 별 빈도수를 계산한다.
        detectFiles.forEach((file) => {
            const { pc_guid } = file;
            // 해당 PC의 빈도수를 증가시킨다.
            if (eventByPc[pc_guid]) {
                eventByPc[pc_guid]++;
            }
            else {
                eventByPc[pc_guid] = 1;
            }
        });
        // 결과에 맞게 점수를 부여한다.(주간 일때는 건당 2점)
        Object.keys(eventByPc).forEach((pcGuid, index) => {
            if (count > 0) {
                if (eventByPc[pcGuid] >= 100 * count) {
                    eventByPc[pcGuid] = 100;
                }
                else if (eventByPc[pcGuid] >= 80 * count) {
                    eventByPc[pcGuid] = 80;
                }
                else if (eventByPc[pcGuid] >= 60 * count) {
                    eventByPc[pcGuid] = 60;
                }
                else if (eventByPc[pcGuid] >= 40 * count) {
                    eventByPc[pcGuid] = 40;
                }
                else if (eventByPc[pcGuid] >= 20 * count) {
                    eventByPc[pcGuid] = 20;
                }
                else if (eventByPc[pcGuid] >= 10 * count) {
                    eventByPc[pcGuid] = 10;
                }
                else if (eventByPc[pcGuid] >= 5 * count) {
                    eventByPc[pcGuid] = 5;
                }
                else {
                    eventByPc[pcGuid] = 0;
                }
            }
            else {
                if (eventByPc[pcGuid] >= 100) {
                    eventByPc[pcGuid] = 100;
                }
                else if (eventByPc[pcGuid] >= 80) {
                    eventByPc[pcGuid] = 80;
                }
                else if (eventByPc[pcGuid] >= 60) {
                    eventByPc[pcGuid] = 60;
                }
                else if (eventByPc[pcGuid] >= 40) {
                    eventByPc[pcGuid] = 40;
                }
                else if (eventByPc[pcGuid] >= 20) {
                    eventByPc[pcGuid] = 20;
                }
                else if (eventByPc[pcGuid] >= 10) {
                    eventByPc[pcGuid] = 10;
                }
                else if (eventByPc[pcGuid] >= 5) {
                    eventByPc[pcGuid] = 5;
                }
                else {
                    eventByPc[pcGuid] = 0;
                }
            }
        });
        // 점수를 기준으로 내림차순 정렬
        const sortedEventByPc = Object.fromEntries(Object.entries(eventByPc).sort(([, a], [, b]) => b - a));
        return sortedEventByPc;
    }
    analyzeEventsByYear(detectFiles, count) {
        // PC 별로 유출 빈도 수를 counting 할 객체
        const eventByPc = {};
        // 배열을 확인하면서 pc 별 빈도수를 계산한다.
        detectFiles.forEach((file) => {
            const { pc_guid } = file;
            // 해당 PC의 빈도수를 증가시킨다.
            if (eventByPc[pc_guid]) {
                eventByPc[pc_guid]++;
            }
            else {
                eventByPc[pc_guid] = 1;
            }
        });
        // 결과에 맞게 점수를 부여한다.(주간 일때는 건당 2점)
        Object.keys(eventByPc).forEach((pcGuid, index) => {
            if (count > 0) {
                if (eventByPc[pcGuid] >= 100 * count * 12) {
                    eventByPc[pcGuid] = 100;
                }
                else if (eventByPc[pcGuid] >= 80 * count * 12) {
                    eventByPc[pcGuid] = 80;
                }
                else if (eventByPc[pcGuid] >= 60 * count * 12) {
                    eventByPc[pcGuid] = 60;
                }
                else if (eventByPc[pcGuid] >= 40 * count * 12) {
                    eventByPc[pcGuid] = 40;
                }
                else if (eventByPc[pcGuid] >= 20 * count * 12) {
                    eventByPc[pcGuid] = 20;
                }
                else if (eventByPc[pcGuid] >= 10 * count * 12) {
                    eventByPc[pcGuid] = 10;
                }
                else if (eventByPc[pcGuid] >= 5 * count * 12) {
                    eventByPc[pcGuid] = 5;
                }
                else {
                    eventByPc[pcGuid] = 0;
                }
            }
            else {
                if (eventByPc[pcGuid] >= 100) {
                    eventByPc[pcGuid] = 100;
                }
                else if (eventByPc[pcGuid] >= 80) {
                    eventByPc[pcGuid] = 80;
                }
                else if (eventByPc[pcGuid] >= 60) {
                    eventByPc[pcGuid] = 60;
                }
                else if (eventByPc[pcGuid] >= 40) {
                    eventByPc[pcGuid] = 40;
                }
                else if (eventByPc[pcGuid] >= 20) {
                    eventByPc[pcGuid] = 20;
                }
                else if (eventByPc[pcGuid] >= 10) {
                    eventByPc[pcGuid] = 10;
                }
                else if (eventByPc[pcGuid] >= 5) {
                    eventByPc[pcGuid] = 5;
                }
                else {
                    eventByPc[pcGuid] = 0;
                }
            }
        });
        // 점수를 기준으로 내림차순 정렬
        const sortedEventByPc = Object.fromEntries(Object.entries(eventByPc).sort(([, a], [, b]) => b - a));
        return sortedEventByPc;
    }
    analyzeFileSizeByWeek(detectFiles) {
        //압축 파일 확장자
        const validExtensions = [".zip", ".zipx", ".gz", ".z", ".egg", ".7z", ".ar", ".lz", ".lz4", ".ace", ".alz", ".lzh", ".lha", ".rar", ".bz2"];
        // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
        const fileSizeByPc = {};
        // detectFiles 배열을 순회하면서 PC 별로 파일 크기의 총합을 계산
        detectFiles.forEach((file) => {
            const { pc_guid, file_size, org_file } = file;
            //파일 경로를 기준으로 마지막 점을 찾는다.
            const lasDotIndex = org_file.lastIndexOf(".");
            // 파일 경로에서 확장자를 추출
            const extension = org_file.substring(lasDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
            // 문자열을 숫자로 변환하여 파일 크기를 더함
            const fileSize = parseInt(file_size, 10);
            // 해당 PC의 파일 크기가 이미 저장되어 있다면 파일 크기를 더해줌
            // 압축 파일은 3배 곱해서 산정함
            if (validExtensions.includes("." + extension)) {
                //압축 파일인지 판별한다
                if (fileSizeByPc[pc_guid]) {
                    fileSizeByPc[pc_guid] += fileSize * 3;
                }
                else {
                    fileSizeByPc[pc_guid] = fileSize * 3;
                }
            }
            else {
                if (fileSizeByPc[pc_guid]) {
                    fileSizeByPc[pc_guid] += fileSize;
                }
                else {
                    fileSizeByPc[pc_guid] = fileSize;
                }
            }
        });
        Object.keys(fileSizeByPc).forEach((pcGuid, index) => {
            if (fileSizeByPc[pcGuid] >= 100000000) {
                fileSizeByPc[pcGuid] = 100;
            }
            else if (fileSizeByPc[pcGuid] >= 80000000) {
                fileSizeByPc[pcGuid] = 80;
            }
            else if (fileSizeByPc[pcGuid] >= 60000000) {
                fileSizeByPc[pcGuid] = 60;
            }
            else if (fileSizeByPc[pcGuid] >= 40000000) {
                fileSizeByPc[pcGuid] = 40;
            }
            else if (fileSizeByPc[pcGuid] >= 20000000) {
                fileSizeByPc[pcGuid] = 20;
            }
            else if (fileSizeByPc[pcGuid] >= 10000000) {
                fileSizeByPc[pcGuid] = 10;
            }
            else if (fileSizeByPc[pcGuid] >= 50000000) {
                fileSizeByPc[pcGuid] = 5;
            }
            else {
                fileSizeByPc[pcGuid] = 0;
            }
        });
        // 점수를 기준으로 내림차순 정렬
        const sortedFileSizeByPc = Object.fromEntries(Object.entries(fileSizeByPc).sort(([, a], [, b]) => b - a));
        return sortedFileSizeByPc;
    }
    analyzeFileSizeByMonth(detectFiles, count) {
        const validExtensions = [".zip", ".zipx", ".gz", ".z", ".egg", ".7z", ".ar", ".lz", ".lz4", ".ace", ".alz", ".lzh", ".lha", ".rar", ".bz2"];
        // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
        const fileSizeByPc = {};
        // detectFiles 배열을 순회하면서 PC 별로 파일 크기의 총합을 계산
        detectFiles.forEach((file) => {
            const { pc_guid, file_size, org_file } = file;
            //파일 경로를 기준으로 마지막 점을 찾는다.
            const lasDotIndex = org_file.lastIndexOf(".");
            // 파일 경로에서 확장자를 추출
            const extension = org_file.substring(lasDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
            // 문자열을 숫자로 변환하여 파일 크기를 더함
            const fileSize = parseInt(file_size, 10);
            // 해당 PC의 파일 크기가 이미 저장되어 있다면 파일 크기를 더해줌
            // 압축 파일은 3배 곱해서 산정함
            if (validExtensions.includes("." + extension)) {
                //압축 파일인지 판별한다
                if (fileSizeByPc[pc_guid]) {
                    fileSizeByPc[pc_guid] += fileSize * 3;
                }
                else {
                    fileSizeByPc[pc_guid] = fileSize * 3;
                }
            }
            else {
                if (fileSizeByPc[pc_guid]) {
                    fileSizeByPc[pc_guid] += fileSize;
                }
                else {
                    fileSizeByPc[pc_guid] = fileSize;
                }
            }
        });
        Object.keys(fileSizeByPc).forEach((pcGuid, index) => {
            if (fileSizeByPc[pcGuid] >= 20000000 * count) {
                fileSizeByPc[pcGuid] = 100;
            }
            else if (fileSizeByPc[pcGuid] >= 16000000 * count) {
                fileSizeByPc[pcGuid] = 80;
            }
            else if (fileSizeByPc[pcGuid] >= 14000000 * count) {
                fileSizeByPc[pcGuid] = 70;
            }
            else if (fileSizeByPc[pcGuid] >= 10000000 * count) {
                fileSizeByPc[pcGuid] = 50;
            }
            else if (fileSizeByPc[pcGuid] >= 80000000 * count) {
                fileSizeByPc[pcGuid] = 40;
            }
            else if (fileSizeByPc[pcGuid] >= 60000000 * count) {
                fileSizeByPc[pcGuid] = 30;
            }
            else if (fileSizeByPc[pcGuid] >= 40000000 * count) {
                fileSizeByPc[pcGuid] = 20;
            }
            else if (fileSizeByPc[pcGuid] >= 20000000 * count) {
                fileSizeByPc[pcGuid] = 10;
            }
            else if (fileSizeByPc[pcGuid] >= 10000000 * count) {
                fileSizeByPc[pcGuid] = 5;
            }
            else {
                fileSizeByPc[pcGuid] = 0;
            }
        });
        // 점수를 기준으로 내림차순 정렬
        const sortedFileSizeByPc = Object.fromEntries(Object.entries(fileSizeByPc).sort(([, a], [, b]) => b - a));
        return sortedFileSizeByPc;
    }
    analyzePatternsDBSort(detectFiles) {
        const patternsSummary = {};
        detectFiles.forEach((file) => {
            const { pc_guid, patterns } = file;
            if (!patternsSummary[pc_guid])
                patternsSummary[pc_guid] = {};
            if (patterns !== "") {
                const patternEntries = patterns.split(", ").map((pattern) => {
                    const [keyword, count] = pattern.split(":");
                    return { keyword, count: parseInt(count, 10) };
                });
                patternEntries.forEach(({ keyword, count }) => {
                    patternsSummary[pc_guid][keyword] = (patternsSummary[pc_guid][keyword] || 0) + count;
                });
            }
        });
        // 최종 문자열 형태로 변환
        const result = {};
        Object.entries(patternsSummary).forEach(([pcGuid, keywordCounts]) => {
            const summaryString = Object.entries(keywordCounts)
                .map(([keyword, count]) => `${keyword}:${count}`)
                .join(", ");
            result[pcGuid] = summaryString;
        });
        return result;
    }
    calculatePatternScore(patternCount, riskLevel) {
        const baseScorePerPattern = 1; // 패턴당 기본 점수
        const maxPatternCount = 1000; // 최대 발견 가능한 패턴 수
        const maxScore = 200; // 최대 점수
        const minPatternCount = 10; // 최소 패턴 발견 수
        const minRiskLevel = 1; // 최소 위험도
        // 패턴당 점수 계산
        let patternScore = (Math.min(patternCount, maxPatternCount) / 10) * baseScorePerPattern;
        // 위험도에 따른 가중치 적용
        patternScore *= riskLevel / 10;
        patternScore *= 2;
        // 최대 점수 제한
        if (riskLevel === 0) {
            patternScore = 0;
        }
        else {
            patternScore = Math.min(patternScore, maxScore);
        }
        return Math.round(patternScore);
    }
    analyzeKeywordsListScoring(patternsDB, keywordList) {
        const keywordsResult = {};
        // patternsDB 객체를 순회합니다.
        Object.entries(patternsDB).forEach(([pcGuid, patternStr]) => {
            let score = 0.0;
            // patternStr을 콤마로 분리하여 각 패턴을 배열로 변환합니다.
            const patterns = patternStr.split(", ");
            // 각 패턴에 대해 반복하며 keywordList에 존재하는지 확인합니다.
            patterns.forEach((pattern) => {
                var _a;
                const [keyword, countStr] = pattern.split(":");
                if (keywordList[keyword]) {
                    // keywordList에 정의된 키워드의 level 값으로 점수를 계산합니다.
                    const cal = ((_a = keywordList[keyword]) === null || _a === void 0 ? void 0 : _a.level) * 10;
                    if (score < cal) {
                        score = cal;
                    }
                }
            });
            if (keywordsResult[pcGuid] === undefined || keywordsResult[pcGuid] === null) {
                keywordsResult[pcGuid] = 0;
            }
            // 최종 계산된 점수를 keywordsResult 객체에 저장합니다.
            if (keywordsResult[pcGuid] < score) {
                keywordsResult[pcGuid] = score;
                // keywordsResult[pcGuid].patternLevel = this.analyzePatternsLevel(score, true);
            }
        });
        return keywordsResult;
    }
    analyzePatternsListScoring(patternsDB, keywordList) {
        const keywordsResult = {};
        const keyList = Object.keys(keywordList);
        // patternsDB 객체를 순회합니다.
        Object.entries(patternsDB).forEach(([pcGuid, patternStr]) => {
            let score = 0.0;
            // patternStr을 콤마로 분리하여 각 패턴을 배열로 변환합니다.
            const patterns = patternStr.split(", ");
            // 각 패턴에 대해 반복하며 keywordList에 존재하는지 확인합니다.
            patterns.forEach((pattern) => {
                var _a;
                const [keyword, countStr] = pattern.split(":");
                const count = parseInt(countStr, 10);
                // 1000건 이상일 경우 무조건 1000건으로 설정
                if (count > 1000)
                    count === 1000;
                if (keyList.includes(keyword)) {
                    // keywordList에 정의된 키워드의 level 값으로 점수를 계산합니다.
                    const cal = this.calculatePatternScore(count, +((_a = keywordList[keyword]) === null || _a === void 0 ? void 0 : _a.level));
                    if (score < cal) {
                        score = cal;
                    }
                }
            });
            score /= keyList.length;
            if (keywordsResult[pcGuid] === undefined || keywordsResult[pcGuid] === null) {
                keywordsResult[pcGuid] = 0;
            }
            // 최종 계산된 점수를 keywordsResult 객체에 저장합니다.
            if (keywordsResult[pcGuid] < score) {
                keywordsResult[pcGuid] = score;
            }
        });
        return keywordsResult;
    }
    analyzePatternsLevel(score, keywordFlag) {
        // keywordFlag : 키워드(true), 건수(false)
        let w = 1;
        let level = 0;
        if (keywordFlag === false) {
            w = 2;
        }
        if (score >= 0 && score <= 20 * w) {
            level = 1;
        }
        else if (score > 20 * w && score <= 40 * w) {
            level = 2;
        }
        else if (score > 40 * w && score <= 60 * w) {
            level = 3;
        }
        else if (score > 60 * w && score <= 80 * w) {
            level = 4;
        }
        else if (score > 80 * w && score <= 100 * w) {
            level = 5;
        }
        return level;
    }
    // 집합의 다양성 점수를 계산하는 함수입니다. 0이 아닌 요소의 개수를 기반으로 점수를 계산합니다.
    calculateDiversityScore(values) {
        // 0이 아닌 요소의 개수를 계산합니다.
        const nonZeroCount = values.filter((v) => v > 0).length;
        // 0이 아닌 요소 하나당 10점을 부여하여 다양성 점수를 계산합니다.
        return nonZeroCount * 10;
    }
    // 집합의 평균 값을 계산하는 함수입니다.
    calculateAverage(values) {
        // 집합의 모든 요소의 합을 계산합니다.
        const sum = values.reduce((acc, curr) => acc + curr, 0);
        // 합계를 요소의 개수로 나누어 평균을 계산합니다.
        return sum / values.length;
    }
    // 집합의 표준 편차를 계산하는 함수입니다.
    calculateStandardDeviation(values, avg) {
        // 분산을 계산합니다. 각 요소에서 평균을 뺀 값의 제곱의 평균입니다.
        const variance = values.reduce((acc, curr) => acc + (curr - avg) ** 2, 0) / values.length;
        // 분산의 제곱근을 통해 표준 편차를 계산합니다.
        return Math.sqrt(variance);
    }
    // 최종 점수를 계산하는 함수입니다. 이 함수는 집합 A와 B의 평균, 표준 편차, 다양성 점수를 계산하여 최종 점수를 도출합니다.
    calculateFinalScore(setValue) {
        //  평균을 계산합니다.
        const avg = this.calculateAverage(setValue);
        // 표준 편차를 계산합니다.
        const stdDevA = this.calculateStandardDeviation(setValue, avg);
        // 다양성 점수를 계산합니다.
        // const diversityScoreB = this.calculateDiversityScore(setValue);
        // 최종 점수는 평균, 표준 편차, 그리고 다양성 점수의 합입니다.
        const finalScore = avg + stdDevA;
        // 최종 점수를 배열로 반환합니다.
        return finalScore;
    }
}
exports.default = Average;
