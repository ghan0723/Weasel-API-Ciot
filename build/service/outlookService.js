"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const generateRandom_1 = require("../interface/generateRandom");
const fs_1 = __importDefault(require("fs"));
class OutlookService {
    constructor() {
        // Old_C
        this.columnAliasKo = {
            // alias    table명
            'id': 'id', // 0
            탐지시각: 'time', // 1
            PC명: 'pc_name', // 2
            AGENTIP: 'latest_agent_ip', // 3
            프로세스명: 'proc_name', // 4
            PID: 'proc_id', // 5
            메일명: 'subject', // 6
            보낸사람: 'sender', // 7
            받은사람: 'receivers', // 8
            유출파일명: 'attachments', // 9
            // 전송갯수 : 'backup_file',   // 10 => 삭제됨
            파일크기: 'file_size', // 10
            탐지패턴: 'patterns', // 11
            파일다운로드: 'backup_file', // 12
            'upload_state': "upload_state", // 13
        };
        // New_C
        this.columnAlias = {
            // alias    table명
            'id': 'id', // 0
            'Time': 'time', // 1
            'PcName': 'pc_name', // 2
            'Agent_ip': 'latest_agent_ip', // 3
            'Process': 'proc_name', // 4
            'PIDS': 'proc_id', // 5
            'Mail_Subjects': 'subject', // 6
            'Sender': 'sender', // 7
            'Receiver': 'receivers', // 8
            'AttachedFiles': 'attachments', // 9
            // 'CopiedFiles' : 'backup_file',   // 10 => 삭제됨
            'FileSizes': 'file_size', // 10
            'Keywords': 'patterns', // 11
            'Downloading': 'backup_file', // 12
            'upload_state': "upload_state", // 13
        };
    }
    getCountAll(select, ipRanges) {
        let dayOption1;
        let dayOption2;
        if (select === "day") {
            dayOption1 = "CURDATE(), INTERVAL 0 DAY";
            dayOption2 = "CURDATE(), INTERVAL 1 DAY";
        }
        else if (select === "week") {
            dayOption1 = "CURDATE(), INTERVAL 1 WEEK";
            dayOption2 = "CURDATE(), INTERVAL 2 WEEK";
        }
        else {
            dayOption1 = "CURDATE(), INTERVAL 1 MONTH";
            dayOption2 = "CURDATE(), INTERVAL 2 MONTH";
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as alloutlooks FROM leakedoutlookfiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            const query3 = `SELECT COUNT(*) as beforeoutlooks FROM leakedoutlookfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].alloutlooks;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query3, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query2 = result[0].beforeoutlooks;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    alloutlooks: this.query1,
                    beforeoutlooks: this.query2 !== 0
                        ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                        : ((this.query1 / 1) * 100).toFixed(2),
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getApiData(page, pageSize, sorting, desc, category, search, ipRanges, privilege, excel) {
        let queryPage = 0;
        let queryPageSize = 0;
        let querySorting = sorting === '' ? 'time' : sorting;
        let queryDesc = desc === 'false' ? 'asc' : 'desc';
        let whereClause = '';
        let aliasKey;
        let aliasValues;
        let convertColumns;
        convertColumns = category !== "" && this.columnAlias[category];
        if (!excel) {
            aliasKey = Object.keys(this.columnAlias);
            aliasValues = Object.values(this.columnAlias);
        }
        else {
            aliasKey = Object.keys(this.columnAliasKo);
            aliasValues = Object.values(this.columnAliasKo);
        }
        if (page !== undefined) {
            queryPage = Number(page);
        }
        if (pageSize !== undefined) {
            queryPageSize = Number(pageSize);
        }
        if (sorting === '' && desc === '') {
            sorting = 'time';
            desc = 'desc';
        }
        // IP 범위 조건들을 생성
        const ipConditions = ipRanges
            .map((range) => `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`)
            .join(" OR ");
        if (search !== '') {
            whereClause = `where ${convertColumns} like ? AND (${ipConditions})`;
        }
        else {
            whereClause = `where ${ipConditions}`;
        }
        return new Promise((resolve, reject) => {
            const queryStr = privilege !== 3 ?
                `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, 
      ${aliasValues[5]} as ${aliasKey[5]}, ${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, 
      ${aliasValues[9]} as ${aliasKey[9]}, ${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]}, ${aliasValues[12]} as ${aliasKey[12]}
      , ${aliasValues[13]} as ${aliasKey[13]} `
                :
                    `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, 
      ${aliasValues[5]} as ${aliasKey[5]}, ${aliasValues[6]} as ${aliasKey[6]}, ${aliasValues[7]} as ${aliasKey[7]}, ${aliasValues[8]} as ${aliasKey[8]}, 
      ${aliasValues[9]} as ${aliasKey[9]}, ${aliasValues[10]} as ${aliasKey[10]}, ${aliasValues[11]} as ${aliasKey[11]} `;
            let query = '';
            if (!excel) {
                query =
                    queryStr +
                        "from leakedoutlookfiles " +
                        whereClause +
                        ' order by ' + querySorting + ' ' + queryDesc + ' ' +
                        'LIMIT ' + queryPageSize + ' offset ' + queryPage * queryPageSize;
            }
            else {
                query =
                    queryStr +
                        "from leakedoutlookfiles " +
                        whereClause +
                        ' order by ' + querySorting + ' ' + queryDesc + ' ';
            }
            const query2 = "select count(*) as count from leakedoutlookfiles " + whereClause;
            const whereQuery = '%' + search + '%';
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, whereQuery, (error, result) => {
                        const excludedKeys = ['파일다운로드', 'upload_state'];
                        const excludedKeysMonitor = ['Downloading', '파일다운로드', 'upload_state'];
                        if (!excel) {
                            result.map((data, i) => {
                                if (privilege !== 3) {
                                    const date = data.Time.split(' ')[0];
                                    const fileName = `C:/Program Files (x86)/ciot/WeaselServer/Temp/${date}/${data.Agent_ip}.${data.id}.${data.Downloading}`;
                                    if (fs_1.default.existsSync(`${fileName}.enc`) && result[i].upload_state === '2') {
                                        result[i].Downloading = `${data.Agent_ip}.${data.id}.${data.Downloading}`;
                                    }
                                    else if (result[i].upload_state === '3') {
                                        result[i].Downloading = result[i].upload_state;
                                    }
                                    else {
                                        result[i].Downloading = '';
                                    }
                                    delete result[i].upload_state;
                                }
                                else {
                                    delete result[i].Downloading;
                                }
                            });
                        }
                        else {
                            result.map((data, i) => {
                                delete result[i].파일다운로드;
                            });
                        }
                        const filteredKeys = privilege !== 3
                            ? aliasKey.filter((key) => !excludedKeys.includes(key))
                            : aliasKey.filter((key) => !excludedKeysMonitor.includes(key));
                        // 검색 결과가 없을 경우의 처리
                        if (result.length === 0) {
                            result[0] = filteredKeys.reduce((obj, key) => {
                                obj[key] = '';
                                return obj;
                            }, {});
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query2, whereQuery, (error, result) => {
                        if (result[0].count === 0) {
                            result[0].count = 1;
                        }
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            innerResolve(result); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then((values) => {
                resolve(values);
            })
                .catch((error) => reject(error));
        });
    }
    // 송신탐지내역 테이블 데이터 삭제
    getUpdateUpLoad(id) {
        const query = `update leakedoutlookfiles set upload_state = 1 WHERE id = ${id}`;
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
    // 송신탐지내역 테이블 데이터 삭제
    postRemoveData(body) {
        // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
        const idString = body.map((id) => `'${id}'`).join(", ");
        const query = `DELETE FROM leakedoutlookfiles WHERE id IN (${idString})`;
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
    // DummyData 생성
    getDummyData(count) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            let queryDay;
            let queryMonth;
            let queryDayStr;
            let queryMonthStr;
            let queryYearStr;
            let agentIp;
            let proc_name;
            for (let i = 0; i < count; i++) {
                if (i % 3 === 0) {
                    agentIp = '10.10.10.157';
                    proc_name = 'proc_name1';
                }
                else if (i % 3 === 1) {
                    agentIp = '192.168.1.54';
                    proc_name = 'proc_name2';
                }
                else {
                    agentIp = '10.10.10.126';
                    proc_name = 'proc_name3';
                }
                // 날짜 계산
                date.setDate(date.getDate() - 1);
                if (date.getDate() === 0)
                    date.setDate(0);
                queryDay = date.getDate();
                queryMonth = date.getMonth() + 1;
                queryYearStr = date.getFullYear().toString();
                if (queryDay < 10) {
                    queryDayStr = '0' + queryDay;
                }
                else {
                    queryDayStr = queryDay.toString();
                }
                if (queryMonth < 10) {
                    queryMonthStr = '0' + queryMonth;
                }
                else {
                    queryMonthStr = queryMonth.toString();
                }
                const getTime = (0, generateRandom_1.generateRandomDateTime)();
                // New_C
                const query = `insert into leakedoutlookfiles (
        time,
        pc_guid,
        pc_name,
        proc_name,
        proc_id,
        latest_agent_ip,
        subject,
        sender,
        receivers,
        attachments,
        backup_file,
        file_size,
        patterns,
        upload_state)
      values 
      (
      '${getTime}',
      'PCGUID${i + 1}',
      'PCname${i + 1}',      
      '${process}',
      '23564',
      '${agentIp}',
      'FW: F5 웹방화벽 장애 원인분석 및 조치결과 보고서',
      'smlee@stemsoft.co.kr',
      'smlee@stemsoft.co.kr;',
      'image001.png, (220721) F5 웹방화벽 장애 원인분석 및 조치결과 보고서.docx',
      'DESKTOP-O14QCIB++2022-08-17 09.38.00++UP++(220721) F5 웹방화벽 장애 원인분석 및 조치결과 보고서.docx',
      '39630',
      'Keyword${i + 1}',
      '111');`;
                try {
                    const result = yield new Promise((resolve, reject) => {
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
                catch (error) {
                }
            }
        });
    }
}
exports.default = OutlookService;
