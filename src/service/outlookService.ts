import connection from "../db/db";

class OutlookService {
  private query1!: number;
  private query2!: number;

  getCountAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "select count(*) as alloutlooks from outlookpstviewer where time Like CONCAT('%', CURDATE(), '%')";
      const query3 =
        "select count(*) as beforeoutlooks from outlookpstviewer where time LIKE CONCAT('%', (CURDATE()- INTERVAL 1 DAY), '%')";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].alloutlooks;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforeoutlooks;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            alloutlooks: this.query1,
            beforeoutlooks:
            (this.query2 !== 0) ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2) : (this.query1 / 1 * 100).toFixed(2),
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getApiData(): Promise<any>{
    return new Promise((resolve, reject) => {
      const query = 'select * from outlookpstviewer';
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        }else{
          resolve(result);
        }
      })
    })
  };
}

export default OutlookService;
