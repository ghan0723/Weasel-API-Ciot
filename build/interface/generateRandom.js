"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDetectFiles = exports.generateRandomDateTime = exports.generateDetectFiles = void 0;
const db_1 = __importDefault(require("../db/db"));
function generateDetectFiles(numFiles) {
    const detectFiles = [];
    const pcGuids = ['PC11', 'PC22', 'PC33', 'PC44', 'PC55', 'PC17', 'PC27', 'PC37', 'PC47', 'PC57'];
    const procNames = ['Process1', 'Process2', 'Process3', 'Process4', 'Process5'];
    const orgFiles = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt'];
    const patterns = ['주민번호', '핸드폰번호', '입사지원서', ''];
    const uploadStates = ['Y', 'N'];
    const scrdmpUploadStates = ['Y', 'N'];
    const eventCodes = ['CO_EVENT', 'FA_EVENT', 'SA_EVENT'];
    let patternsValue = '';
    for (let i = 0; i < numFiles; i++) {
        const pcguidName = pcGuids[Math.floor(Math.random() * pcGuids.length)];
        const patternName = patterns[Math.floor(Math.random() * patterns.length)];
        if (patternName === '') {
            patternsValue = '';
        }
        else {
            if (pcguidName === 'PC4' || pcguidName === 'PC5') {
                patternsValue = '';
            }
            else {
                patternsValue = patternName + ':' + Math.floor(Math.random() * 99 + 1).toString();
            }
        }
        const file = {
            time: generateRandomDateTime(),
            pc_guid: `${pcguidName}`,
            pc_name: `PC_Name_${i + 1}`,
            proc_name: procNames[Math.floor(Math.random() * procNames.length)],
            proc_id: Math.random().toString(36).substring(2, 8).toUpperCase(),
            latest_agent_ip: generateRandomIPAddress(),
            src_ip: generateRandomIPAddress(),
            src_port: Math.floor(Math.random() * 65536).toString(),
            dst_ip: generateRandomIPAddress(),
            dst_port: Math.floor(Math.random() * 65536).toString(),
            org_file: orgFiles[Math.floor(Math.random() * orgFiles.length)],
            upload_state: uploadStates[Math.floor(Math.random() * uploadStates.length)],
            scrdmp_upload_state: scrdmpUploadStates[Math.floor(Math.random() * scrdmpUploadStates.length)],
            file_size: Math.floor(Math.random() * 1000000).toString(),
            patterns: `${patternsValue}`,
            url: `http://example.com/file${i + 1}`,
            backup_file: `backup_file_${i + 1}.txt`,
            accurate: Math.floor(Math.random() * 2),
            eventCO: eventCodes[Math.floor(Math.random() * eventCodes.length)],
            eventFA: eventCodes[Math.floor(Math.random() * eventCodes.length)],
            eventSA: eventCodes[Math.floor(Math.random() * eventCodes.length)]
        };
        detectFiles.push(file);
    }
    return detectFiles;
}
exports.generateDetectFiles = generateDetectFiles;
function generateRandomDateTime() {
    const startDate = new Date(2024, 0, 1).getTime();
    const endDate = new Date().getTime();
    const randomDate = new Date(startDate + Math.random() * (endDate - startDate));
    return randomDate.toISOString().replace('T', ' ').substring(0, 19);
}
exports.generateRandomDateTime = generateRandomDateTime;
function generateRandomIPAddress() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
// 파일 배열을 DB에 삽입하는 함수
function insertDetectFiles(detectFiles) {
    // 파일 배열을 삽입할 INSERT INTO 쿼리 작성
    const query = 'INSERT INTO LeakedNetworkFiles (time, pc_guid, pc_name, proc_name, proc_id, latest_agent_ip, src_ip, src_port, dst_ip, dst_port, org_file, upload_state, scrdmp_upload_state, file_size, patterns, url, backup_file, accurate, eventCO, eventFA, eventSA) VALUES ?';
    // 파일 배열을 이차원 배열 형태로 변환
    const values = detectFiles.map(file => [
        file.time,
        file.pc_guid,
        file.pc_name,
        file.proc_name,
        file.proc_id,
        file.latest_agent_ip,
        file.src_ip,
        file.src_port,
        file.dst_ip,
        file.dst_port,
        file.org_file,
        file.upload_state,
        file.scrdmp_upload_state,
        file.file_size,
        file.patterns,
        file.url,
        file.backup_file,
        file.accurate,
        file.eventCO,
        file.eventFA,
        file.eventSA
    ]);
    // 쿼리 실행
    db_1.default.query(query, [values], (error, results) => {
        if (error) {
            console.error('파일 삽입 중 오류 발생:', error);
        }
        else {
        }
    });
}
exports.insertDetectFiles = insertDetectFiles;
