"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Average {
    // 시간대 및 프로세스 기반 파일 유출 분석
    analyzeLeaksByTimeAndProcess(detectFiles) {
        const processAnalysis = detectFiles.reduce((acc, file) => {
            const hour = new Date(file.time).getHours();
            const process = file.process || 'Unknown';
            if (!acc[hour])
                acc[hour] = {};
            if (!acc[hour][process])
                acc[hour][process] = { count: 0, files: [] };
            acc[hour][process].count += 1;
            acc[hour][process].files.push(file.file);
            return acc;
        }, {});
        // 분석 결과 출력
        Object.entries(processAnalysis).forEach(([hour, processes]) => {
            console.log(`시간대 ${hour}:`);
            Object.entries(processes).forEach(([process, data]) => {
                console.log(`  프로세스 ${process}: 유출 사건 ${data.count}건, 파일 목록: ${data.files.join(', ')}`);
            });
        });
    }
}
exports.default = Average;
