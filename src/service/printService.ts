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
            (this.query1 / this.query2) * 100 || 0,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default PrintService;
