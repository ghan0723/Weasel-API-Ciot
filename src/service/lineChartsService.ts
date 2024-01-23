import { IpRange } from "../interface/interface";
import moment from "moment";
import { Connection, MysqlError } from "mysql";
import { resolve } from "path";

interface ResultMonth {
  month: string;
  count: number;
}

interface ResultWeek {
  week: string;
  count: number;
}

interface ResultDay {
  day: string;
  count: number;
}

class LineChartsService {
  private connection: Connection;
  private contents = [
    "detectfiles",
    "detectmediafiles",
    "outlookpstviewer",
    "detectprinteddocuments",
  ];
  private yearArray: string[] = [];
  private monthArray: number[] = [];

  // 월,주,일 계산
  private monthlyArray = this.generateMonthlyArray();
  private weeksArray = this.calculateWeeksArray();
  private oneWeekDates = this.getOneWeekDates();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // // tables year count
  // getTablesYearData(): Promise<any> {
  //     return new Promise((resolve, reject) => {
  //         Promise.all([
  //             this.getTableYear(0),
  //             this.getTableYear(1),
  //             this.getTableYear(2),
  //             this.getTableYear(3),
  //         ])
  //         .then((values) => {
  //             // console.log("this.yearArray : ",this.yearArray);

  //             // console.log("values : ", values);

  //             let chkData = [];

  //             for(let i=0; i < values.length; i++) {
  //                 let data = [];

  //                 for(let j=0; j < this.yearArray.length; j++) {

  //                 }

  //                 chkData.push({
  //                     name : values.at(i).name,

  //                 })
  //             }

  //             resolve(values);
  //         })
  //         .catch((error) => {
  //             reject(error);
  //         });
  //     });
  // }

  // getTableYear(num:number): Promise<any> {
  //     return new Promise((resolve, reject) => {
  //         let query = "select substring(time, 1, 4) as year, count(*) as count" +
  //         " from " + this.contents[num] +
  //         " where time not like '%null%' " +
  //         " group by substring(time, 1, 4);";

  //         this.connection.query(query, (error, results) => {
  //             if(error) {
  //                 reject(error);
  //             } else {
  //                 const resultValue:any = {
  //                     name : this.contents[num],
  //                     data : results
  //                 };

  //                 for(let i=0; i < results.length; i++) {
  //                     console.log("this.yearArray.includes(results[i].year)", this.yearArray.includes(results[i].year));
  //                     if(this.yearArray.includes(results[i].year) === false) {
  //                         this.yearArray.push(results[i].year);
  //                     }
  //                 }

  //                 // console.log("results : ", results);
  //                 // console.log("resultValue : ", resultValue);

  //                 resolve(resultValue);
  //             }
  //         });
  //     })
  // }

  generateMonthlyArray(): string[] {
    const currentDate = new Date();
    let str: string = "";
    const months: string[] = [];

    // 1년 전의 현재 월부터 현재 월까지 반복
    for (let i = -10; i <= 1; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() + i);

      if (date.getMonth() === 0) {
        str = "12";
      } else if (date.getMonth() < 10) {
        str = "0" + date.getMonth();
      } else {
        str = date.getMonth().toString();
      }

      months.push(str);
    }

    return months;
  }

  // tables month count(1년치 data)
  getTablesMonthData(ipRanges: IpRange[]): Promise<any> {
    let monthArray: number[] = [];

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getTableMonth(0,ipRanges),
        this.getTableMonth(1,ipRanges),
        this.getTableMonth(2,ipRanges),
        this.getTableMonth(3,ipRanges),
      ]).then((values) => {
        for (const month of this.monthlyArray) {
          monthArray.push(+month);
        }

        values.push(monthArray);

        resolve(values);
      });
    });
  }

  getTableMonth(num: number,ipRanges: IpRange[]): Promise<any> {
    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
    .map(
        (range) =>
        `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
    )
    .join(" OR ");

    return new Promise((resolve, reject) => {
      let str = "";
      let query =
        "select substring(time, 6, 2) as month, count(*) as count" +
        " from " +
        this.contents[num] +
        " where time not like '%null%' and" +
        " date_format(time, '%y-%m-%d %h:%m:%s') > date_sub(NOW(), interval 1 Year) and" +
        " date_format(time, '%y-%m-%d %h:%m:%s') <= NOW() AND (" + ipConditions + ")" +
        " group by substring(time, 6, 2);";

      this.connection.query(
        query,
        (error: MysqlError, results: ResultMonth[]) => {
          if (error) {
            reject(error);
          } else {
            const resultValue: any = {
              name: this.contents[num],
              data: [],
            };

            for (const month of this.monthlyArray) {              
              const value = results.find((data) => +data.month === +month);

              if (value === undefined) {
                resultValue.data.push(0);
              } else {
                resultValue.data.push(value.count);
              }
            }

            resolve(resultValue);
          }
        }
      );
    });
  }

  // week
  calculateWeeksArray(): string[] {
    const currentDate = moment(); // 현재 날짜
    const weeks = [];

    for (let i = 4; i >= 0; i--) {
        const startDate = currentDate.clone().subtract(i, 'weeks').startOf('isoWeek');
        const startDateMonth = startDate.clone().startOf('month');
        
        const weekNumber = Math.ceil(startDate.diff(startDateMonth, 'days') / 7) + 1; // 그 외의 경우 월별 주차 계산
        weeks.push(`${startDate.format('YYYY.MM.')}${weekNumber}`);
    }

    return weeks;
  }

  getTablesWeekData(ipRanges: IpRange[]): Promise<any> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getTableWeek(0,ipRanges),
        this.getTableWeek(1,ipRanges),
        this.getTableWeek(2,ipRanges),
        this.getTableWeek(3,ipRanges),
      ])
        .then((values) => {
        // weekStr Naming
        const weekStr = this.weeksArray.map(str => {
            let converseStr = str.slice(2) + '주차';
            return converseStr;
        });        

          values.push(weekStr);

          resolve(values);
        })
        .catch(() => {
          reject();
        });
    });
  }

  getTableWeek(num: number,ipRanges: IpRange[]): Promise<any> {
    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    return new Promise((resolve, reject) => {
      let query = `SELECT 
            CAST(
                CONCAT(
                    YEAR,
                    '.',
                    CASE 
                        WHEN MONTH < 10 THEN CONCAT('0', MONTH)
                        ELSE MONTH
                    END,
                    '.',
                    calWeek
                ) AS CHAR
            ) as week,
            COUNT(*) AS count
        FROM (
            SELECT 
                YEAR(STR_TO_DATE(time, '%Y-%m-%d %H:%i:%s')) AS Year,
                MONTH(STR_TO_DATE(time, '%Y-%m-%d %H:%i:%s')) AS Month,
                (WEEK(time, 1) - WEEK(DATE_FORMAT(time, '%Y-%m-01'), 1) + 1) AS calWeek,
                time
            FROM 
                ${this.contents[num]}
            WHERE
                ${ipConditions}
        ) AS subquery
        WHERE 
            STR_TO_DATE(subquery.time, '%Y-%m-%d %H:%i:%s') >= DATE_SUB(NOW(), INTERVAL 5 WEEK)
        GROUP BY 
            Year, Month, calWeek
        ORDER BY 
            Year, Month, calWeek;`;

      this.connection.query(
        query,
        (error: MysqlError, results: ResultWeek[]) => {
          if (error) {
            reject(error);
          } else {
            const resultValue:any = {
                name : this.contents[num],
                data : []
            };

            for(const week of this.weeksArray) {
                const value = results.find(data => data.week === week);

                if(value === undefined) {
                    resultValue.data.push(0);
                } else {
                    resultValue.data.push(value.count);
                }
            }

            resolve(resultValue);
          }
        }
      );
    });
  }

  // tables day count(7일치 data)
  getOneWeekDates(): number[] {
    const oneWeekDates: number[] = [];
    const today = new Date();
    const currentDay = today.getDate() - 6;

    // 현재 날짜부터 1주일 동안의 날짜를 배열에 추가
    for (let i = 0; i < 7; i++) {
      const day = currentDay + i;
      if (day > 0) {
        oneWeekDates.push(day);
      } else {
        // 현재 달의 이전 달로 이동
        const previousMonthLastDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ).getDate();
        oneWeekDates.push(previousMonthLastDay + day);
      }
    }

    return oneWeekDates;
  }

  getTablesDayData(ipRanges: IpRange[]): Promise<any> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getTableDay(0,ipRanges),
        this.getTableDay(1,ipRanges),
        this.getTableDay(2,ipRanges),
        this.getTableDay(3,ipRanges),
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

  getTableDay(num: number,ipRanges: IpRange[]): Promise<any> {
    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    return new Promise((resolve, reject) => {
      let str = "";
      let query =
        "select substring(time, 9, 2) as day, count(*) as count" +
        " from " +
        this.contents[num] +
        " where time not like '%null%' and" +
        " date_format(time, '%y-%m-%d %h:%m:%s') > date_sub(NOW(), interval 1 Week) and" +
        " date_format(time, '%y-%m-%d %h:%m:%s') <= NOW() AND (" + ipConditions + ")" +
        " group by substring(time, 9, 2);";

      this.connection.query(
        query,
        (error: MysqlError, results: ResultDay[]) => {          
          if (error) {
            reject(error);
          } else {
            const resultValue: any = {
              name: this.contents[num],
              data: [],
            };

            for (const day of this.oneWeekDates) {
              const value = results.find((data) => +data.day === day);

              if (value === undefined) {
                resultValue.data.push(0);
              } else {
                resultValue.data.push(value.count);
              }
            }

            resolve(resultValue);
          }
        }
      );
    });
  }
}

export default LineChartsService;
