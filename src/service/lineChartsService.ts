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
  // Old_C
  private contents = [
    "leakednetworkfiles",
    "leakedmediafiles",
    "leakedoutlookfiles",
    "leakedprintingfiles",
  ];

  // New_C
  // private contents = [
  //   "LeakedNetworkFiles",
  //   "LeakedMediaFiles",
  //   "LeakedOutlookFiles",
  //   "LeakedPrintingFiles",
  // ];
  private yearArray: string[] = [];
  private monthArray: number[] = [];

  // 월,주,일 계산
  private monthlyArray = this.generateMonthlyArray();
  private weeksArray = this.calculateWeeksArray();
  private oneWeekDates = this.getOneWeekDates();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  generateMonthlyArray(): string[] {
    const currentDate = new Date();
    let str: string = "";
    let sliceNumber = -1;
    const currentMonth:number = currentDate.getMonth() + 1;
    const value: string[] = ['01','02','03','04','05','06','07','08','09','10','11','12'];

    // 1년 전의 현재 월부터 현재 월까지 반복
    for (let i = 0; i <= value.length-1; i++) {
      if(currentMonth === +value[i]) {
        sliceNumber = i+1;
        break;
      }
    }

    const months = value.slice(sliceNumber).concat(value.slice(0, sliceNumber));
    

    // months.push(str);
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
        `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
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
                         
              const value = results.find((data) => {                
                return +data.month === +month
              });

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
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
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
          `(INET_ATON(latest_agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
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
