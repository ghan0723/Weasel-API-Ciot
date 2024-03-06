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
class MediaService {
    constructor() {
        // Old_Columns
        this.columnAliasKo = {
            // alias    table명
            'id': 'id', // 0
            탐지시각: 'time', // 1
            PC명: 'pc_name', // 2
            AGENTIP: 'latest_agent_ip', // 3
            프로세스명: 'proc_name', // 4
            유출유형: 'media_type', // 5
            유출파일명: 'org_file', // 6
            // 복사된파일 : 'backup_file', // 7 => 사용 안함
            파일다운로드: 'backup_file', // 7
            파일크기: 'file_size', // 8
            탐지패턴: 'patterns', // 9
        };
        // New_Columns
        this.columnAlias = {
            // alias    table명
            'id': 'id', // 0
            'Time': 'time', // 1
            'PcName': 'pc_name', // 2
            'Agent_ip': 'latest_agent_ip', // 3
            'Process': 'proc_name', // 4
            'Media_Type': 'media_type', // 5
            'Files': 'org_file', // 6
            // 'Copied_files' : 'backup_file', // 7 => 사용 안함
            'Downloading': 'backup_file', // 7
            'FileSizes': 'file_size', // 8
            'Keywords': 'patterns', // 9
        };
    }
    getMediaAll(select, ipRanges) {
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
            const query = `SELECT COUNT(*) as allmedias FROM leakedmediafiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            const query3 = `SELECT COUNT(*) as beforemedias FROM leakedmediafiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, (error, result) => {
                        if (error) {
                            innerReject(error);
                        }
                        else {
                            this.query1 = result[0].allmedias;
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
                            this.query2 = result[0].beforemedias;
                            innerResolve(); // 빈 인수로 호출
                        }
                    });
                }),
            ])
                .then(() => {
                resolve({
                    allmedias: this.query1,
                    beforemedias: this.query2 !== 0
                        ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                        : ((this.query1 / 1) * 100).toFixed(2),
                });
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    // 송신탐지내역 테이블
    getApiData(page, pageSize, sorting, desc, category, search, ipRanges, privilege, excel) {
        let queryPage = 0;
        let queryPageSize = 0;
        let querySorting = sorting === '' ? 'time' : sorting;
        let queryDesc = desc === 'false' ? 'asc' : 'desc';
        let whereClause = '';
        let aliasKey;
        let aliasValues;
        let convertColumns;
        if (!excel) {
            aliasKey = Object.keys(this.columnAlias);
            aliasValues = Object.values(this.columnAlias);
            convertColumns = category !== "" && this.columnAlias[category];
        }
        else {
            aliasKey = Object.keys(this.columnAliasKo);
            aliasValues = Object.values(this.columnAliasKo);
            convertColumns = category !== "" && this.columnAliasKo[category];
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
                `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, ${aliasValues[6]} as ${aliasKey[6]},
      ${aliasValues[7]} as ${aliasKey[7]},
      ${aliasValues[8]} as ${aliasKey[8]}, ${aliasValues[9]} as ${aliasKey[9]} `
                :
                    `select ${aliasValues[0]}, ${aliasValues[1]} as ${aliasKey[1]}, ${aliasValues[2]} as ${aliasKey[2]}, ${aliasValues[3]} as ${aliasKey[3]}, ${aliasValues[4]} as ${aliasKey[4]}, ${aliasValues[5]} as ${aliasKey[5]}, ${aliasValues[6]} as ${aliasKey[6]},
      ${aliasValues[8]} as ${aliasKey[8]}, ${aliasValues[9]} as ${aliasKey[9]} `;
            const query = queryStr +
                "from leakedmediafiles " +
                whereClause +
                ' order by ' + querySorting + ' ' + queryDesc + ' ' +
                'LIMIT ' + queryPageSize + ' offset ' + queryPage * queryPageSize;
            const query2 = "select count(*) as count from leakedmediafiles " + whereClause;
            const whereQuery = '%' + search + '%';
            Promise.all([
                new Promise((innerResolve, innerReject) => {
                    db_1.default.query(query, whereQuery, (error, result) => {
                        const excludedKeys = ['Downloading'];
                        const filteredKeys = privilege !== 3 ? aliasKey : aliasKey.filter((key) => !excludedKeys.includes(key));
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
    postRemoveData(body) {
        // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
        const idString = body.map((id) => `'${id}'`).join(", ");
        const query = `DELETE FROM leakedmediafiles WHERE id IN (${idString})`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    console.log("삭제하다가 사고남");
                    reject(error);
                }
                else {
                    console.log("삭제 성공");
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
            for (let i = 0; i < count; i++) {
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
                const query = `insert into leakedmediafiles
     (time,
      pc_guid,
      pc_name,
      proc_name,
      proc_id,
      latest_agent_ip,
    media_type,
    org_file,
    backup_file,
    file_size,
    patterns,
    upload_state)
  values 
  (
  '${getTime}',
  'PCGUID${i + 1}',
  'PCNAME${i + 1}',  
  'skcertservice.exe',
  '8892',
  '10.10.10.157',
  'USB',
  'd:\\npki\\signkorea\\user\\cn=이상만-274795,ou=hts,ou=삼성,ou=증권,o=signkorea,c=kr\\signpri.key',
  'DESKTOP-O14QCIB++2022-09-13 22.34.15++BT++signpri.key',
  '1346',
  '',
  '111');`;
                try {
                    const result = yield new Promise((resolve, reject) => {
                        db_1.default.query(query, (error, result) => {
                            if (error) {
                                console.log("getDummyData 에러 발생");
                                reject(error);
                            }
                            else {
                                console.log("데이터 삽입 성공");
                                resolve(result);
                            }
                        });
                    });
                    console.log(`데이터 삽입 ${i + 1}번째 성공`);
                }
                catch (error) {
                    console.log(`데이터 삽입 ${i + 1}번째 실패: ${error}`);
                }
            }
        });
    }
}
exports.default = MediaService;
