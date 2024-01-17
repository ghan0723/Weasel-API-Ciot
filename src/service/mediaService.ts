import { IpRange } from "../interface/interface";
import connection from "../db/db";

class MediaService {
  private query1!: number;
  private query2!: number;

  getMediaAll(select: any, ipRanges: IpRange[]): Promise<any> {
    let dayOption1: string;
    let dayOption2: string;

    if (select === "day") {
      dayOption1 = "CURDATE(), INTERVAL 0 DAY";
      dayOption2 = "CURDATE(), INTERVAL 1 DAY";
    } else if (select === "week") {
      dayOption1 = "CURDATE(), INTERVAL 1 WEEK";
      dayOption2 = "CURDATE(), INTERVAL 2 WEEK";
    } else {
      dayOption1 = "CURDATE(), INTERVAL 1 MONTH";
      dayOption2 = "CURDATE(), INTERVAL 2 MONTH";
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");

    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as allmedias FROM detectmediafiles WHERE time >= DATE_SUB(${dayOption1}) AND (${ipConditions})`;
      const query3 = `SELECT COUNT(*) as beforemedias FROM detectmediafiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1}) AND (${ipConditions})`;

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
              this.query2 !== 0
                ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2)
                : ((this.query1 / 1) * 100).toFixed(2),
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getApiData(page: any, pageSize: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "select id, `time` as Time, pcname , agent_ip , process, media_type , file as Files , " +
        "saved_file as Copied_files, saved_file as Downloading , " +
        "file_size as File_Sizes , keywords as Keywords " +
        "from detectmediafiles " +
        "order by `time` desc" +
        "LIMIT " +
        pageSize +
        " offset " +
        page * pageSize;

      const query2 = "select count(*) as count from detectmediafiles;";

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          connection.query(query2, (error, result) => {
            if (error) {
              innerReject(error);
            } else {
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
      ])
        .then((values) => {
          console.log("values : ", values);

          resolve(values);
        })
        .catch((error) => reject(error));
    });
  }
}

export default MediaService;
