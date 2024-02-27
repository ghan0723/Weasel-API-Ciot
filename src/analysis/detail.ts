import connection from "../db/db";
import Analysis from "../service/analysisService";

class Detail {
  async getAnalysisLineDateByPcGuid(
    pcGuid: any,
    dateRange: any,
    startDate: any,
    endDate: any,
    numericValue:any
  ) {
    // 최종 결과를 저장할 객체
    let result: any = {};
    // dateRange가 'week'인 경우
    if (dateRange.includes("week")) {
      result[pcGuid] = { date: [], data: [] };
      result["average"] = { date: [], data: [] };

      for (
        let date = new Date(startDate);
        date <= new Date(endDate);
        date = new Date(date.getTime() + 86400000)
      ) {
        try {
          const result2 = await this.getCountForDate(date, pcGuid, false);
          // 결과 처리
          const count = result2[0].count;
          result[pcGuid].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
          result[pcGuid].data.push(count); // count를 data 배열에 추가
            
          const result3 = await this.getCountForDate(date, pcGuid, true);
          const count2 = result3[0].count;
          const result4 = await this.getDistinctGuid(date, pcGuid);
          const averageData = (count2 / result4.length) || 0;
          result["average"].date.push(this.dateFormat(date).split("-")[2]+"일"); // 날짜를 date 배열에 추가
          result["average"].data.push(parseFloat(averageData.toFixed(2))); // count를 data 배열에 추가
        } catch (error) {
          // 오류 처리
          console.error(error);
        }
      }
    } else if ((dateRange.includes("month") && numericValue === 1) || (dateRange.includes("month") && numericValue === 3)){
        result[pcGuid] = { date: [], data: [] };
        result["average"] = { date: [], data: [] };
        const endDateObj = new Date(endDate);
        let currentDate = new Date(startDate);
        while (currentDate <= endDateObj) {
            let currentDatePlus3 = new Date(currentDate);
            currentDatePlus3.setDate(currentDatePlus3.getDate() + (3 * numericValue));
            try {
                const result2 = await this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, false);
                const count = result2[0].count;
                result[pcGuid].date.push(this.dateFormat(currentDate));
                result[pcGuid].data.push(count);
                const result3 = await this.getCountForMonth(currentDate, currentDatePlus3, pcGuid, true);
                const count2 = result3[0].count;
                const result4 = await this.getDistinctGuidByMonth(currentDate, currentDatePlus3, pcGuid);
                const averageData = (count2 / result4.length) || 0;
                result["average"].date.push(this.dateFormat(currentDate).split("-")[1]+"/"+this.dateFormat(currentDate).split("-")[2]);
                result["average"].data.push(parseFloat(averageData.toFixed(2)));
            } catch (error) {
                console.error(error);
            }

            // 현재 날짜에 3일을 더함
            currentDate.setDate(currentDate.getDate() + (3 * numericValue));
        }
    } else if ((dateRange.includes('year'))){
        result[pcGuid] = { date: [], data: [] };
        result["average"] = { date: [], data: [] };
        const endDateObj = new Date(endDate);
        let currentDate = new Date(startDate);
        while (currentDate <= endDateObj) {
            let currentDatePlus = new Date(currentDate);
            currentDatePlus.setMonth(currentDatePlus.getMonth()+1);
            try {
                const result2 = await this.getCountForMonth(currentDate, currentDatePlus, pcGuid, false);
                const count = result2[0].count;
                result[pcGuid].date.push(this.dateFormat(currentDatePlus));
                result[pcGuid].data.push(count);
                const result3 = await this.getCountForMonth(currentDate, currentDatePlus, pcGuid, true);
                const count2 = result3[0].count;
                const result4 = await this.getDistinctGuidByMonth(currentDate, currentDatePlus, pcGuid);
                const averageData = (count2 / result4.length) || 0;
                result["average"].date.push(this.dateFormat(currentDatePlus).split("-")[1]+"월");
                result["average"].data.push(parseFloat(averageData.toFixed(2)));
            } catch (error) {
                console.error(error);
            }

            // 현재 날짜에 3일을 더함
            currentDate.setMonth(currentDate.getMonth()+1);
        }
    }

    console.log("제발  : ", result);
    return result;
  }

  getCountForDate(date: any, pcGuid: any, other: any): Promise<any> {
    const day1 = this.dateFormat(date) + " 00:00:00";
    const day2 = this.dateFormat(date) + " 23:59:59";
    const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
    let query = "";
    if (other) {
      query = `select count(*) as count from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
    } else {
      query = `select count(*) as count from leakednetworkfiles where pc_guid = '${pcGuid}' And (${dayOption})`;
    }
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getCountForMonth(date1: any, date2:any, pcGuid: any, other: any): Promise<any> {
    const day1 = this.dateFormat(date1) + " 00:00:00";
    const day2 = this.dateFormat(date2) + " 23:59:59";
    const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
    let query = "";
    if (other) {
      query = `select count(*) as count from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
    } else {
      query = `select count(*) as count from leakednetworkfiles where pc_guid = '${pcGuid}' And (${dayOption})`;
    }
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  dateFormat(date: Date) {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더함
    const day = ("0" + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  getDistinctGuid(date: any, pcGuid: any): Promise<any> {
    const day1 = this.dateFormat(date) + " 00:00:00";
    const day2 = this.dateFormat(date) + " 23:59:59";
    const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
    const query = `select distinct(pc_guid) as guid from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getDistinctGuidByMonth(date1: any,date2:any, pcGuid: any): Promise<any> {
    const day1 = this.dateFormat(date1) + " 00:00:00";
    const day2 = this.dateFormat(date2) + " 23:59:59";
    const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
    const query = `select distinct(pc_guid) as guid from leakednetworkfiles where pc_guid != '${pcGuid}' And (${dayOption})`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
export default Detail;
