import { Connection } from "mysql";

class NetworkService {
  private connection: Connection;
  private query1!: number;
  private query2!: number;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  getCountAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query3 =
        "SELECT COUNT(*) as allfiles FROM detectfiles WHERE time LIKE CONCAT('%', CURDATE(), '%')";
      const query4 =
        "SELECT COUNT(*) as beforefiles FROM detectfiles WHERE time LIKE CONCAT('%', (CURDATE()- INTERVAL 1 DAY), '%')";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query3, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query1 = result[0].allfiles;
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query4, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              this.query2 = result[0].beforefiles;
              console.log("result[0].beforefiles : ", result[0].beforefiles);
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then(() => {
          resolve({
            allfiles: this.query1,
            beforefiles:
            (this.query2 !== 0) ? (this.query1 / this.query2) * 100 : 0,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default NetworkService;
