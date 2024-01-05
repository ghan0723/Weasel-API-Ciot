import { Connection, MysqlError } from "mysql";
import { resolve } from "path";

interface ResultMonth {
    month : string,
    count : number
}

class LineChartsService {
    private connection:Connection;
    private contents = ['detectfiles', 'detectmediafiles', 'outlookpstviewer', 'detectprinteddocuments'];
    private yearArray:string[] = [];
    private monthArray:number[] = [];
    private monthlyArray = this.generateMonthlyArray();

    constructor(connection:Connection) {
        this.connection = connection;
    }

    // tables year count
    getTablesYearData(): Promise<any> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableYear(0),
                this.getTableYear(1),
                this.getTableYear(2),
                this.getTableYear(3),
            ])
            .then((values) => {
                console.log("this.yearArray : ",this.yearArray);
                
                console.log("values : ", values);

                let chkData = [];

                for(let i=0; i < values.length; i++) {
                    let data = [];

                    for(let j=0; j < this.yearArray.length; j++) {
                        
                    }

                    chkData.push({
                        name : values.at(i).name,

                    })
                }

                resolve(values);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    getTableYear(num:number): Promise<any> {
        return new Promise((resolve, reject) => {
            let query = "select substring(time, 1, 4) as year, count(*) as count" + 
            " from " + this.contents[num] +
            " where time not like '%null%' " +
            " group by substring(time, 1, 4);";

            this.connection.query(query, (error, results) => {
                if(error) {
                    reject(error);                        
                } else {
                    const resultValue:any = {
                        name : this.contents[num], 
                        data : results
                    };

                    for(let i=0; i < results.length; i++) {
                        console.log("this.yearArray.includes(results[i].year)", this.yearArray.includes(results[i].year));
                        if(this.yearArray.includes(results[i].year) === false) {
                            this.yearArray.push(results[i].year);
                        }
                    }

                    console.log("results : ", results);
                    console.log("resultValue : ", resultValue);
                    
                    resolve(resultValue);
                }
            });
        })
    }

    generateMonthlyArray(): string[] {
        const currentDate = new Date();
        let str:string = "";
        const months:string[] = [];
    
        // 1년 전의 현재 월부터 현재 월까지 반복
        for (let i = -10; i <= 1; i++) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() + i);
            
            if(date.getMonth() === 0) {
                str = "12";
            } else if(date.getMonth() < 10) {
                str = "0" + date.getMonth();
            } else {
                str = date.getMonth().toString();
            }

            months.push(str);
        }
    
        return months;
    }

    // tables month count
    getTablesMonthData(): Promise<any> {
        let monthArray:number[] = [];

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getTableMonth(0),
                this.getTableMonth(1),
                this.getTableMonth(2),
                this.getTableMonth(3),
            ])
            .then((values) => {
                console.log("values : ", values);
                console.log("this.monthArray : ", this.monthArray);

                for(const month of this.monthlyArray) {
                    monthArray.push(+month);
                }

                values.push(monthArray);

                resolve(values);
            });
        });
    }

    getTableMonth(num:number): Promise<any> {
        return new Promise((resolve, reject) => {
            let str = "";
            let query = "select substring(time, 6, 2) as month, count(*) as count" + 
            " from " + this.contents[num] +
            " where time not like '%null%' and" +
            " date_format(time, '%y-%m-%d %h:%m:%s') > date_sub(curdate(), interval 1 Year) and" + 
            " date_format(time, '%y-%m-%d %h:%m:%s') < curdate()" +
            " group by substring(time, 6, 2);";

            this.connection.query(query, (error:MysqlError, results:ResultMonth[]) => {
                if(error) {
                    reject(error);                        
                } else {
                    const resultValue:any = {
                        name : this.contents[num], 
                        data : []
                    };

                    console.log("results : ", results);
                    console.log("result-type : ", typeof(results));

                    for(const month of this.monthlyArray) {
                        const value = results.find(data => data.month === month);

                        if(value === undefined) {
                            resultValue.data.push(0);
                        } else {
                            resultValue.data.push(value.count);
                        }
                    }

                    console.log("resultValue : ", resultValue);
                    console.log("this.monthArray : ", this.monthArray);
                    
                    resolve(resultValue);
                }
            });
        })
    }
}

export default LineChartsService;