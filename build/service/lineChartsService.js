"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LineChartsService {
    constructor(connection) {
        this.contents = ['detectfiles', 'detectmediafiles', 'outlookpstviewer', 'detectprinteddocuments'];
        this.yearArray = [];
        this.monthArray = [];
        this.monthlyArray = this.generateMonthlyArray();
        this.oneWeekDates = this.getOneWeekDates();
        this.connection = connection;
    }
    // tables year count
    getTablesYearData() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableYear(0),
                this.getTableYear(1),
                this.getTableYear(2),
                this.getTableYear(3),
            ])
                .then((values) => {
                // console.log("this.yearArray : ",this.yearArray);
                // console.log("values : ", values);
                let chkData = [];
                for (let i = 0; i < values.length; i++) {
                    let data = [];
                    for (let j = 0; j < this.yearArray.length; j++) {
                    }
                    chkData.push({
                        name: values.at(i).name,
                    });
                }
                resolve(values);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    getTableYear(num) {
        return new Promise((resolve, reject) => {
            let query = "select substring(time, 1, 4) as year, count(*) as count" +
                " from " + this.contents[num] +
                " where time not like '%null%' " +
                " group by substring(time, 1, 4);";
            this.connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    const resultValue = {
                        name: this.contents[num],
                        data: results
                    };
                    for (let i = 0; i < results.length; i++) {
                        console.log("this.yearArray.includes(results[i].year)", this.yearArray.includes(results[i].year));
                        if (this.yearArray.includes(results[i].year) === false) {
                            this.yearArray.push(results[i].year);
                        }
                    }
                    // console.log("results : ", results);
                    // console.log("resultValue : ", resultValue);
                    resolve(resultValue);
                }
            });
        });
    }
    generateMonthlyArray() {
        const currentDate = new Date();
        let str = "";
        const months = [];
        // 1년 전의 현재 월부터 현재 월까지 반복
        for (let i = -10; i <= 1; i++) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() + i);
            if (date.getMonth() === 0) {
                str = "12";
            }
            else if (date.getMonth() < 10) {
                str = "0" + date.getMonth();
            }
            else {
                str = date.getMonth().toString();
            }
            months.push(str);
        }
        return months;
    }
    // tables month count(1년치 data)
    getTablesMonthData() {
        let monthArray = [];
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableMonth(0),
                this.getTableMonth(1),
                this.getTableMonth(2),
                this.getTableMonth(3),
            ])
                .then((values) => {
                for (const month of this.monthlyArray) {
                    monthArray.push(+month);
                }
                values.push(monthArray);
                resolve(values);
            });
        });
    }
    getTableMonth(num) {
        return new Promise((resolve, reject) => {
            let str = "";
            let query = "select substring(time, 6, 2) as month, count(*) as count" +
                " from " + this.contents[num] +
                " where time not like '%null%' and" +
                " date_format(time, '%y-%m-%d %h:%m:%s') > date_sub(NOW(), interval 1 Year) and" +
                " date_format(time, '%y-%m-%d %h:%m:%s') <= NOW()" +
                " group by substring(time, 6, 2);";
            this.connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    const resultValue = {
                        name: this.contents[num],
                        data: []
                    };
                    for (const month of this.monthlyArray) {
                        const value = results.find(data => data.month === month);
                        if (value === undefined) {
                            resultValue.data.push(0);
                        }
                        else {
                            resultValue.data.push(value.count);
                        }
                    }
                    resolve(resultValue);
                }
            });
        });
    }
    // tables day count(7일치 data)
    getOneWeekDates() {
        const oneWeekDates = [];
        const today = new Date();
        const currentDay = today.getDate();
        // 현재 날짜부터 1주일 동안의 날짜를 배열에 추가
        for (let i = 0; i < 7; i++) {
            const day = currentDay - i;
            if (day > 0) {
                oneWeekDates.push(day);
            }
            else {
                // 현재 달의 이전 달로 이동
                const previousMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                oneWeekDates.push(previousMonthLastDay + day);
            }
        }
        return oneWeekDates;
    }
    getTablesDayData() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableDay(0),
                this.getTableDay(1),
                this.getTableDay(2),
                this.getTableDay(3),
            ])
                .then((values) => {
                values.push(this.oneWeekDates);
                resolve(values);
            })
                .catch(() => {
                reject();
            });
        });
    }
    getTableDay(num) {
        return new Promise((resolve, reject) => {
            let str = "";
            let query = "select substring(time, 9, 2) as day, count(*) as count" +
                " from " + this.contents[num] +
                " where time not like '%null%' and" +
                " date_format(time, '%y-%m-%d %h:%m:%s') > date_sub(NOW(), interval 1 Year) and" +
                " date_format(time, '%y-%m-%d %h:%m:%s') <= NOW()" +
                " group by substring(time, 6, 2);";
            this.connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    const resultValue = {
                        name: this.contents[num],
                        data: []
                    };
                    for (const month of this.monthlyArray) {
                        const value = results.find(data => data.month === month);
                        if (value === undefined) {
                            resultValue.data.push(0);
                        }
                        else {
                            resultValue.data.push(value.count);
                        }
                    }
                    resolve(resultValue);
                }
            });
        });
    }
}
exports.default = LineChartsService;
