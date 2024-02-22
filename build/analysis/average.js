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
    analyzeEvents(detectFiles) {
        // PC 별로 유출 빈도 수가 특정 이상이 될 경우 counting 할 객체
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
        // 유출 횟수를 기준으로 내림차순 정렬
        const sortedEventByPc = Object.fromEntries(Object.entries(eventByPc).sort(([, a], [, b]) => b - a));
        // 결과 출력 및 점수 부여
        console.log("PC 별 파일 유출 빈도:");
        const maxScore = sortedEventByPc.length; // 배열의 길이가 최고 점수
        let rank = 1;
        Object.keys(sortedEventByPc).forEach((pcGuid, index) => {
            const score = maxScore - index;
            eventByPc[pcGuid] = score;
            console.log(`${pcGuid}: ${eventByPc[pcGuid]}`);
        });
        console.log("eventByPc : ", eventByPc);
        return eventByPc;
    }
    analyzeFileSize(detectFiles) {
        // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
        const fileSizeByPc = {};
        // detectFiles 배열을 순회하면서 PC 별로 파일 크기의 총합을 계산
        detectFiles.forEach((file) => {
            const { pc_guid, file_size } = file;
            // 문자열을 숫자로 변환하여 파일 크기를 더함
            const fileSize = parseInt(file_size, 10);
            // 해당 PC의 파일 크기가 이미 저장되어 있다면 파일 크기를 더해줌
            if (fileSizeByPc[pc_guid] && fileSize > 700000) {
                fileSizeByPc[pc_guid] += 1;
            }
            else if (!fileSizeByPc[pc_guid] && fileSize > 700000) {
                // 해당 PC의 파일 크기가 처음 계산되는 경우, 새로운 항목을 만들어 초기화
                fileSizeByPc[pc_guid] = 1;
            }
        });
        console.log("fileSizeByPc : ", fileSizeByPc);
        // PC별 파일 크기의 총합을 반환
        return fileSizeByPc;
    }
    analyzeFileSizeByFilePath(detectFiles) {
        // PC 별로 파일 크기의 총합을 저장할 객체
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
            if (fileSizeByPc[pc_guid] && fileSize > 500) {
                // 확장자가 zip이나 gz인 경우 파일 크기를 더함
                if (extension === "zip" || extension === "gz") {
                    fileSizeByPc[pc_guid] += 1;
                }
            }
            else if (!fileSizeByPc[pc_guid] && fileSize > 500) {
                // 해당 PC의 파일 크기가 처음 계산되는 경우, 새로운 항목을 만들어 초기화
                // 확장자가 zip이나 gz인 경우 파일 크기를 더함
                if (extension === "zip" || extension === "gz") {
                    fileSizeByPc[pc_guid] = 1; // 초기값을 1으로 설정
                }
            }
        });
        console.log("fileSizeByPc : ", fileSizeByPc);
        // PC별 파일 크기의 총합을 반환
        return fileSizeByPc;
    }
}
exports.default = Average;
