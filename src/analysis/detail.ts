import connection from "../db/db";
import Analysis from "../service/analysisService";

class Detail {
  async getAnalysisLineDateByPcGuid(
    pcGuid: any,
    dateRange: any,
    startDate: any,
    endDate: any,
    numericValue: any
  ) {
    // 최종 결과를 저장할 객체
    let result: any = {};
    // dateRange가 'week'인 경우
    if (dateRange.includes("week")) {
      result[pcGuid] = { date: [], data: [] };
      result["평균"] = { date: [], data: [] };

      for (
        let date = new Date(startDate);
        date <= new Date(endDate);
        date = new Date(date.getTime() + 86400000) // 86400000 : 하루치 ms
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
          const averageData = count2 / result4.length || 0;
          result["평균"].date.push(
            this.dateFormat(date).split("-")[2] + "일"
          ); // 날짜를 date 배열에 추가
          result["평균"].data.push(parseFloat(averageData.toFixed(2))); // count를 data 배열에 추가
        } catch (error) {
          // 오류 처리
          // console.error(error);
        }
      }
    } else if (
      (dateRange.includes("month") && numericValue === 1) ||
      (dateRange.includes("month") && numericValue === 3)
    ) {
      result[pcGuid] = { date: [], data: [] };
      result["평균"] = { date: [], data: [] };
      const endDateObj = new Date(endDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDateObj) {
        let currentDatePlus3 = new Date(currentDate);
        currentDatePlus3.setDate(currentDatePlus3.getDate() + 3 * numericValue);
        try {
          const result2 = await this.getCountForMonth(
            currentDate,
            currentDatePlus3,
            pcGuid,
            false
          );
          const count = result2[0].count;
          result[pcGuid].date.push(this.dateFormat(currentDate));
          result[pcGuid].data.push(count);
          const result3 = await this.getCountForMonth(
            currentDate,
            currentDatePlus3,
            pcGuid,
            true
          );
          const count2 = result3[0].count;
          const result4 = await this.getDistinctGuidByMonth(
            currentDate,
            currentDatePlus3,
            pcGuid
          );
          const averageData = count2 / result4.length || 0;
          result["평균"].date.push(
            this.dateFormat(currentDate).split("-")[1] +
              "/" +
              this.dateFormat(currentDate).split("-")[2]
          );
          result["평균"].data.push(parseFloat(averageData.toFixed(2)));
        } catch (error) {
          // console.error(error);
        }

        // 현재 날짜에 3일을 더함
        currentDate.setDate(currentDate.getDate() + 3 * numericValue);
      }
    } else if (dateRange.includes("year")) {
      result[pcGuid] = { date: [], data: [] };
      result["평균"] = { date: [], data: [] };
      const endDateObj = new Date(endDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDateObj) {
        let currentDateMinus = new Date(currentDate);
        currentDateMinus.setMonth(currentDateMinus.getMonth() - 1);
        try {
          const result2 = await this.getCountForMonth(
            currentDateMinus,
            currentDate,
            pcGuid,
            false
          );
          const count = result2[0].count;
          result[pcGuid].date.push(this.dateFormat(currentDate));
          result[pcGuid].data.push(count);
          const result3 = await this.getCountForMonth(
            currentDateMinus,
            currentDate,
            pcGuid,
            true
          );
          const count2 = result3[0].count;
          const result4 = await this.getDistinctGuidByMonth(
            currentDateMinus,
            currentDate,
            pcGuid
          );
          const averageData = count2 / result4.length || 0;
          result["평균"].date.push(
            this.dateFormat(currentDate).split("-")[1] + "월"
          );
          result["평균"].data.push(parseFloat(averageData.toFixed(2)));
        } catch (error) {
          // console.error(error);
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (dateRange.includes("month") && numericValue === 6) {
      result[pcGuid] = { date: [], data: [] };
      result["평균"] = { date: [], data: [] };
      const endDateObj = new Date(endDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDateObj) {
        let currentDatePlus3 = new Date(currentDate);
        currentDatePlus3.setDate(currentDatePlus3.getDate() + 14);
        try {
          const result2 = await this.getCountForMonth(
            currentDate,
            currentDatePlus3,
            pcGuid,
            false
          );
          const count = result2[0].count;
          result[pcGuid].date.push(this.dateFormat(currentDate));
          result[pcGuid].data.push(count);
          const result3 = await this.getCountForMonth(
            currentDate,
            currentDatePlus3,
            pcGuid,
            true
          );
          const count2 = result3[0].count;
          const result4 = await this.getDistinctGuidByMonth(
            currentDate,
            currentDatePlus3,
            pcGuid
          );
          const averageData = count2 / result4.length || 0;
          result["평균"].date.push(
            this.dateFormat(currentDate).split("-")[1] +
              "/" +
              this.dateFormat(currentDate).split("-")[2]
          );
          result["평균"].data.push(parseFloat(averageData.toFixed(2)));
        } catch (error) {
          // console.error(error);
        }

        // 현재 날짜에 3일을 더함
        currentDate.setDate(currentDate.getDate() + 14);
      }
    }
    
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

  getCountForMonth(
    date1: any,
    date2: any,
    pcGuid: any,
    other: any
  ): Promise<any> {
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

  getDistinctGuidByMonth(date1: any, date2: any, pcGuid: any): Promise<any> {
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

  //여기서부터는 파일 사이즈 관련된 코드
  async getCountFileSize(pcGuid: any, dateRange: any, startDate: any, endDate: any, numericValue: any) {
    // 최종 결과를 저장할 객체
    let result: any = {};
    // 압축 파일 확장자
    const validExtensions = ['.zip', '.zipx', '.gz', '.z', '.egg', '.7z', '.ar', '.lz', '.lz4', '.ace', '.alz', '.lzh', '.lha', '.rar', '.bz2'];
    // dateRange가 'week'인 경우
    if (dateRange.includes("week")) {
        // 배열 초기화
        let dates = [];
        let org_file_sizes = [];
        let comp_file_sizes = [];
        // for문으로 지정한 날짜만큼 반복해서 만들어야함
        for(let date = new Date(startDate); date <= new Date(endDate); date = new Date(date.getTime() + 86400000)){
            try {
                const result2 = await this.getFileSizeForGuid(date, date, pcGuid);
                // 해당 날짜의 결과를 저장할 객체
                let dailyResult: any = { date: this.dateFormat(date).split("-")[2]+"일", org_file_size: 0, comp_file_size: 0 };
                // 가져온 파일들을 하나하나 보고 만들어야함
                result2.forEach((file:any) => {
                    const { file_size, org_file } = file;
                    // 파일 경로를 기준으로 마지막 점을 찾는다.
                    const lastDotIndex = org_file.lastIndexOf(".");
                    // 파일 경로에서 확장자를 추출
                    const extension = org_file.substring(lastDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
                    // 문자열을 숫자로 변환하여 파일 크기를 더함
                    const fileSize = parseInt(file_size, 10);
                    // 압축 파일인지 판별함
                    if(validExtensions.includes("." + extension)){
                        // 압축 파일의 사이즈를 더한다.
                        dailyResult.comp_file_size += fileSize;
                    } else {
                        // 일반 파일 사이즈를 더한다.
                        dailyResult.org_file_size += fileSize;
                    }
                });
                // 최종 결과에 해당 날짜의 결과를 추가
                dates.push(dailyResult.date);
                org_file_sizes.push(dailyResult.org_file_size);
                comp_file_sizes.push(dailyResult.comp_file_size);
            } catch (error) {
                console.error(error);
            }
        }
        // 최종 결과를 구성
        result[pcGuid] = {
            date: dates,
            org_file_size: org_file_sizes,
            comp_file_size: comp_file_sizes
        };
    } else if ((dateRange.includes("month") && numericValue === 1) || (dateRange.includes("month") && numericValue === 3)){
              // 배열 초기화
              let dates = [];
              let org_file_sizes = [];
              let comp_file_sizes = [];
              // while문으로 지정한 날짜만큼 반복
              const endDateObj = new Date(endDate);
              let currentDate = new Date(startDate);
              while (currentDate <= endDateObj) {
                let currentDatePlus3 = new Date(currentDate);
                currentDatePlus3.setDate(currentDatePlus3.getDate() + 3 * numericValue);
                  try {
                      const result2 = await this.getFileSizeForGuid(currentDate, currentDatePlus3, pcGuid);
                      // 해당 날짜의 결과를 저장할 객체
                      let dailyResult: any = { date: this.dateFormat(currentDate).split("-")[1] + "/" + this.dateFormat(currentDate).split("-")[2], org_file_size: 0, comp_file_size: 0 };
                      // 가져온 파일들을 하나하나 보고 만들어야함
                      result2.forEach((file:any) => {
                          const { file_size, org_file } = file;
                          // 파일 경로를 기준으로 마지막 점을 찾는다.
                          const lastDotIndex = org_file.lastIndexOf(".");
                          // 파일 경로에서 확장자를 추출
                          const extension = org_file.substring(lastDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
                          // 문자열을 숫자로 변환하여 파일 크기를 더함
                          const fileSize = parseInt(file_size, 10);
                          // 압축 파일인지 판별함
                          if(validExtensions.includes("." + extension)){
                              // 압축 파일의 사이즈를 더한다.
                              dailyResult.comp_file_size += fileSize;
                          } else {
                              // 일반 파일 사이즈를 더한다.
                              dailyResult.org_file_size += fileSize;
                          }
                      });
                      // 최종 결과에 해당 날짜의 결과를 추가
                      dates.push(dailyResult.date);
                      org_file_sizes.push(dailyResult.org_file_size);
                      comp_file_sizes.push(dailyResult.comp_file_size);
                  } catch (error) {
                      console.error(error);
                  }
                  currentDate.setDate(currentDate.getDate() + 3 * numericValue);
              }
              // 최종 결과를 구성
              result[pcGuid] = {
                  date: dates,
                  org_file_size: org_file_sizes,
                  comp_file_size: comp_file_sizes
              };
    } else if (dateRange.includes("month") && numericValue === 6){
      // 배열 초기화
      let dates = [];
      let org_file_sizes = [];
      let comp_file_sizes = [];
      // while문으로 지정한 날짜만큼 반복
      const endDateObj = new Date(endDate);
      let currentDate = new Date(startDate);
      while (currentDate <= endDateObj) {
        let currentDatePlus3 = new Date(currentDate);
        currentDatePlus3.setDate(currentDatePlus3.getDate() + 14);
          try {
              const result2 = await this.getFileSizeForGuid(currentDate, currentDatePlus3, pcGuid);
              // 해당 날짜의 결과를 저장할 객체
              let dailyResult: any = { date: this.dateFormat(currentDate).split("-")[1] + "/" + this.dateFormat(currentDate).split("-")[2], org_file_size: 0, comp_file_size: 0 };
              // 가져온 파일들을 하나하나 보고 만들어야함
              result2.forEach((file:any) => {
                  const { file_size, org_file } = file;
                  // 파일 경로를 기준으로 마지막 점을 찾는다.
                  const lastDotIndex = org_file.lastIndexOf(".");
                  // 파일 경로에서 확장자를 추출
                  const extension = org_file.substring(lastDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
                  // 문자열을 숫자로 변환하여 파일 크기를 더함
                  const fileSize = parseInt(file_size, 10);
                  // 압축 파일인지 판별함
                  if(validExtensions.includes("." + extension)){
                      // 압축 파일의 사이즈를 더한다.
                      dailyResult.comp_file_size += fileSize;
                  } else {
                      // 일반 파일 사이즈를 더한다.
                      dailyResult.org_file_size += fileSize;
                  }
              });
              // 최종 결과에 해당 날짜의 결과를 추가
              dates.push(dailyResult.date);
              org_file_sizes.push(dailyResult.org_file_size);
              comp_file_sizes.push(dailyResult.comp_file_size);
          } catch (error) {
              console.error(error);
          }
          currentDate.setDate(currentDate.getDate() + 14);
      }
      // 최종 결과를 구성
      result[pcGuid] = {
          date: dates,
          org_file_size: org_file_sizes,
          comp_file_size: comp_file_sizes
      };
} else if (dateRange.includes("year")){
  // 배열 초기화
  let dates = [];
  let org_file_sizes = [];
  let comp_file_sizes = [];
  // while문으로 지정한 날짜만큼 반복
  const endDateObj = new Date(endDate);
  let currentDate = new Date(startDate);
  while (currentDate <= endDateObj) {
    let currentDateMinus = new Date(currentDate);
    currentDateMinus.setMonth(currentDateMinus.getMonth() - 1);
      try {
          const result2 = await this.getFileSizeForGuid(currentDateMinus, currentDate, pcGuid);
          // 해당 날짜의 결과를 저장할 객체
          let dailyResult: any = { date: this.dateFormat(currentDate).split("-")[1] + "월", org_file_size: 0, comp_file_size: 0 };
          // 가져온 파일들을 하나하나 보고 만들어야함
          result2.forEach((file:any) => {
              const { file_size, org_file } = file;
              // 파일 경로를 기준으로 마지막 점을 찾는다.
              const lastDotIndex = org_file.lastIndexOf(".");
              // 파일 경로에서 확장자를 추출
              const extension = org_file.substring(lastDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
              // 문자열을 숫자로 변환하여 파일 크기를 더함
              const fileSize = parseInt(file_size, 10);
              // 압축 파일인지 판별함
              if(validExtensions.includes("." + extension)){
                  // 압축 파일의 사이즈를 더한다.
                  dailyResult.comp_file_size += fileSize;
              } else {
                  // 일반 파일 사이즈를 더한다.
                  dailyResult.org_file_size += fileSize;
              }
          });
          // 최종 결과에 해당 날짜의 결과를 추가
          dates.push(dailyResult.date);
          org_file_sizes.push(dailyResult.org_file_size);
          comp_file_sizes.push(dailyResult.comp_file_size);
      } catch (error) {
          console.error(error);
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
  }
  // 최종 결과를 구성
  result[pcGuid] = {
      date: dates,
      org_file_size: org_file_sizes,
      comp_file_size: comp_file_sizes
  };
}
    return result;
}


  getFileSizeForGuid(date1:any, date2:any, pcGuid:any):Promise<any>{
    const day1 = this.dateFormat(date1) + " 00:00:00";
    const day2 = this.dateFormat(date2) + " 23:59:59";
    const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
    let query = `select file_size, org_file from leakednetworkfiles where pc_guid = '${pcGuid}' And (${dayOption})`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    })
  }
}
export default Detail;
