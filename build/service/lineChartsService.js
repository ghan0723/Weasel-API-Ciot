"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LineChartsService {
    constructor(connection) {
        this.contents = ['detectfiles', 'detectmediafiles', 'outlookpstviewer', 'detectprinteddocuments'];
        this.yearArray = [];
        this.monthArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
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
                console.log("this.yearArray : ", this.yearArray);
                console.log("values : ", values);
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
                    console.log("results : ", results);
                    console.log("resultValue : ", resultValue);
                    resolve(resultValue);
                }
            });
        });
    }
    // tables month count
    getTablesMonthData() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableMonth(0),
                this.getTableMonth(1),
                this.getTableMonth(2),
                this.getTableMonth(3),
            ])
                .then((values) => {
                console.log("values : ", values);
                resolve(values);
            });
        });
    }
    getTableMonth(num) {
        return new Promise((resolve, reject) => {
            let query = "select substring(time, 6, 2) as month, count(*) as count" +
                " from " + this.contents[num] +
                " where time not like '%null%' " +
                " group by substring(time, 6, 2);";
            this.connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                }
                else {
                    const resultValue = [this.contents[num], results[0].month, results[0].count];
                    console.log("resultValue : ", resultValue);
                    resolve(resultValue);
                }
            });
        });
    }
}
exports.default = LineChartsService;
