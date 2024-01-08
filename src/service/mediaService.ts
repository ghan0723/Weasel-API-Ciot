import connection from "../db/db";

class MediaService {
  private query1!: number;
  private query2!: number;

  getMediaAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "select count(*) as allmedias from detectmediafiles where time Like CONCAT('%', CURDATE(), '%')";
      const query3 =
        "select count(*) as beforemedias from detectmediafiles where time LIKE CONCAT('%', (CURDATE()- INTERVAL 1 DAY), '%')";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].allmedias;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforemedias;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            allmedias: this.query1,
            beforemedias:
            (this.query2 !== 0) ? (this.query1 / this.query2) * 100 : (this.query1 / 1) * 100,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default MediaService;
