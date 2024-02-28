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
    getAnalysisLineDateByPcGuid(pcGuid, dateRange, startDate, endDate, numericValue) {
        return __awaiter(this, void 0, void 0, function* () {
            // 최종 결과를 저장할 객체
            let result = {};
            // dateRange가 'week'인 경우
            if (dateRange.includes("week")) {
                result[pcGuid] = { date: [], data: [] };
                result["average"] = { date: [], data: [] };
                for (let date = new Date(startDate); date <= new Date(endDate); date = new Date(date.getTime() + 86400000)) {
                    try {
                        const result2 = yield this.getCountForDate(date, pcGuid, false);
                        // 결과 처리
                        const count = result2[0].count;
                        result[pcGuid].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
                        result[pcGuid].data.push(count); // count를 data 배열에 추가
                        const result3 = yield this.getCountForDate(date, pcGuid, true);
                        const count2 = result3[0].count;
                        const result4 = yield this.getDistinctGuid(date, pcGuid);
                        const averageData = (count2 / result4.length) || 0;
                        result["average"].date.push(this.dateFormat(date).split("-")[2] + "일"); // 날짜를 date 배열에 추가
                        result["average"].data.push(parseFloat(averageData.toFixed(2))); // count를 data 배열에 추가
                    }
                    catch (error) {
                        // 오류 처리
                        console.error(error);
                    }
                }
            }
            else if ((dateRange.includes("month") && numericValue === 1) || (dateRange.includes("month") && numericValue === 3)) {
                result[pcGuid] = { date: [], data: [] };
                result["average"] = { date: [], data: [] };
                const endDateObj = new Date(endDate);
                let currentDate = new Date(startDate);
                while (currentDate <= endDateObj) {
                    let currentDatePlus3 = new Date(currentDate);
                    currentDatePlus3.setDate(currentDatePlus3.getDate() + (3 * numericValue));
                    try {
                        const result2 = yield this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, false);
                        const count = result2[0].count;
                        result[pcGuid].date.push(this.dateFormat(currentDate));
                        result[pcGuid].data.push(count);
                        const result3 = yield this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, true);
                        const count2 = result3[0].count;
                        const result4 = yield this.getDistinctGuidByMonth(currentDate, currentDatePlus3, pcGuid);
                        const averageData = (count2 / result4.length) || 0;
                        result["average"].date.push(this.dateFormat(currentDate).split("-")[1] + "/" + this.dateFormat(currentDate).split("-")[2]);
                        result["average"].data.push(parseFloat(averageData.toFixed(2)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    // 현재 날짜에 3일을 더함
                    currentDate.setDate(currentDate.getDate() + (3 * numericValue));
                }
            }
            else if ((dateRange.includes('year'))) {
                result[pcGuid] = { date: [], data: [] };
                result["average"] = { date: [], data: [] };
                const endDateObj = new Date(endDate);
                let currentDate = new Date(startDate);
                while (currentDate <= endDateObj) {
                    let currentDatePlus = new Date(currentDate);
                    currentDatePlus.setMonth(currentDatePlus.getMonth() + 1);
                    try {
                        const result2 = yield this.getCountForMonth(currentDate, currentDatePlus, pcGuid, false);
                        const count = result2[0].count;
                        result[pcGuid].date.push(this.dateFormat(currentDatePlus));
                        result[pcGuid].data.push(count);
                        const result3 = yield this.getCountForMonth(currentDate, currentDatePlus, pcGuid, true);
                        const count2 = result3[0].count;
                        const result4 = yield this.getDistinctGuidByMonth(currentDate, currentDatePlus, pcGuid);
                        const averageData = (count2 / result4.length) || 0;
                        result["average"].date.push(this.dateFormat(currentDatePlus).split("-")[1] + "월");
                        result["average"].data.push(parseFloat(averageData.toFixed(2)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    // 현재 날짜에 3일을 더함
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
            else if ((dateRange.includes('month') && numericValue === 6)) {
                result[pcGuid] = { date: [], data: [] };
                result["average"] = { date: [], data: [] };
                const endDateObj = new Date(endDate);
                let currentDate = new Date(startDate);
                while (currentDate <= endDateObj) {
                    let currentDatePlus3 = new Date(currentDate);
                    currentDatePlus3.setDate(currentDatePlus3.getDate() + 14);
                    try {
                        const result2 = yield this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, false);
                        const count = result2[0].count;
                        result[pcGuid].date.push(this.dateFormat(currentDate));
                        result[pcGuid].data.push(count);
                        const result3 = yield this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, true);
                        const count2 = result3[0].count;
                        const result4 = yield this.getDistinctGuidByMonth(currentDate, currentDatePlus3, pcGuid);
                        const averageData = (count2 / result4.length) || 0;
                        result["average"].date.push(this.dateFormat(currentDate).split("-")[1] + "/" + this.dateFormat(currentDate).split("-")[2]);
                        result["average"].data.push(parseFloat(averageData.toFixed(2)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    // 현재 날짜에 3일을 더함
                    currentDate.setDate(currentDate.getDate() + 14);
                }
            }
            return result;
        });
    }
    getCountForDate(date, pcGuid, other) {
        const day1 = this.dateFormat(date) + " 00:00:00";
        const day2 = this.dateFormat(date) + " 23:59:59";
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        let query = "";
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
    getCountForMonth(date1, date2, pcGuid, other) {
        const day1 = this.dateFormat(date1) + " 00:00:00";
        const day2 = this.dateFormat(date2) + " 23:59:59";
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        let query = "";
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
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더함
        const day = ("0" + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }
    getDistinctGuid(date, pcGuid) {
        const day1 = this.dateFormat(date) + " 00:00:00";
        const day2 = this.dateFormat(date) + " 23:59:59";
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        const query = `select distinct(pc_guid) as guid from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
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
    getDistinctGuidByMonth(date1, date2, pcGuid) {
        const day1 = this.dateFormat(date1) + " 00:00:00";
        const day2 = this.dateFormat(date2) + " 23:59:59";
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        const query = `select distinct(pc_guid) as guid from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
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
}
exports.default = Detail;
