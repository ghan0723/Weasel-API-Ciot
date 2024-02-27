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
class Detail {
    getAnalysisLineDateByPcGuid(pcGuid, detectFiles, dateRange, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // 최종 결과를 저장할 객체
            let result = {};
            // dateRange가 'week'인 경우
            if (dateRange.includes("week")) {
                result[pcGuid] = { date: [], data: [] };
                result['average'] = { date: [], data: [] };
                for (let date = new Date(startDate); date <= new Date(endDate); date = new Date(date.getTime() + 86400000)) {
                    try {
                        const result2 = yield this.getCountForDate(date, pcGuid, false);
                        // 결과 처리
                        const count = result2[0].count;
                        result[pcGuid].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
                        result[pcGuid].data.push(count); // count를 data 배열에 추가
                        const result3 = yield this.getCountForDate(date, pcGuid, true);
                        const count2 = result3[0].count;
                        result['average'].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
                        result['average'].data.push(count2); // count를 data 배열에 추가
                    }
                    catch (error) {
                        // 오류 처리
                        console.error(error);
                    }
                }
            }
            return result;
        });
    }
    getCountForDate(date, pcGuid, other) {
        const day1 = this.dateFormat(date) + '00:00:00';
        const day2 = this.dateFormat(date) + '23:59:59';
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        let query = '';
        if (other) {
            query = `select count(*) as count from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
        }
        else {
            query = `select count(*) as count from leakednetworkfiles where pc_guid = '${pcGuid}' And (${dayOption})`;
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
    dateFormat(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더함
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day} `;
    }
}
exports.default = Detail;
