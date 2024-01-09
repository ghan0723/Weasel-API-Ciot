import connection from "../db/db";

class PrintService {
  private query1!: number;
  private query2!: number;

  getCountAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "select count(*) as allprints from detectprinteddocuments where time Like CONCAT('%', CURDATE(), '%')";
      const query3 =
        "select count(*) as beforeprints from detectprinteddocuments where time LIKE CONCAT('%', (CURDATE()- INTERVAL 1 DAY), '%')";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].allprints;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforeprints;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            allprints: this.query1,
            beforeprints:
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
      const query = 'select * from detectprinteddocuments';
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

export default PrintService;
