import connection from "../db/db";

class PieChartService {

  getPieDataToday(): Promise<any> {
    //매개변수를 Table 명을 정하는 값으로 받을꺼임
    const queryNet1 =
      "select process, count(process) as count from detectfiles where time LIKE CONCAT('%', (CURDATE()), '%') group by process";
    const queryNet2 =
      "select count(*) as totalCount from detectfiles where time LIKE CONCAT('%', (CURDATE()), '%')";
    return new Promise<any>((resolve, reject) => {
      connection.query(queryNet1, (error, result1) => {
        if (error) {
          reject(error);
        } else {
          connection.query(queryNet2, (error2, result2) => {
            if (error2) {
              reject(error2);
            }
            const data = result1.map((item: any) => {
              const count = (item.count / result2[0].totalCount) * 100;
              console.log("hcount : ", count);

              return {
                process: item.process,
                count: item.count,
                hcount: Math.floor(count),
                day: Date.now(),
              };
            });
            data.sort((a:any, b:any) => b.count - a.count);
            console.log("data : ", data);
            resolve(data);
          });
        }
      });
    });
  }
}

export default PieChartService;
