import connection from "../db/db";
import Analysis from "../service/analysisService";

class Detail {

    async getAnalysisLineDateByPcGuid(pcGuid: any, detectFiles: any, dateRange: any, startDate: any, endDate: any) {
        // 최종 결과를 저장할 객체
        let result: any = {};
        // dateRange가 'week'인 경우
        if (dateRange.includes("week")) {
            result[pcGuid] = { date:[], data: [] };
            result['average'] = { date:[], data: [] };
            
            for (let date = new Date(startDate); date <= new Date(endDate); date = new Date(date.getTime() + 86400000)) {
                try {
                    const result2 = await this.getCountForDate(date, pcGuid, false);
                    // 결과 처리
                    const count = result2[0].count;
                    result[pcGuid].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
                    result[pcGuid].data.push(count); // count를 data 배열에 추가

                    const result3 = await this.getCountForDate(date, pcGuid, true);
                    const count2 = result3[0].count;
                    result['average'].date.push(this.dateFormat(date)); // 날짜를 date 배열에 추가
                    result['average'].data.push(count2); // count를 data 배열에 추가
                } catch (error) { 
                    // 오류 처리
                    console.error(error);
                }
            }

        }
        return result;
    }
    

    getCountForDate(date: any, pcGuid: any, other:any): Promise<any>{
        const day1 = this.dateFormat(date) + '00:00:00';
        const day2 = this.dateFormat(date) + '23:59:59';
        const dayOption = `time >= '${day1}' AND time <= '${day2}'`;
        let query = '';
        if(other){
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
    
    dateFormat(date:Date){
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 1을 더함
        const day = ('0' + date.getDate()).slice(-2);
        
        return `${year}-${month}-${day} `;  
    }

}
export default Detail;
