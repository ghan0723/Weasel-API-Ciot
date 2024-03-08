import connection from "../db/db";

class ProfileService {
  getProfile(username: string): Promise<any> {
    const query =
      "select username, passwd, privilege, ip_ranges, pwd_change_freq from accountlist where username = ? ";

    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  modUser(
    user: { username: string; passwd: string },
    oldname: string
  ): Promise<any> {
    const query = `UPDATE accountlist SET username = '${user.username}', passwd = '${user.passwd}' WHERE username = '${oldname}'`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.log("데이터 업데이트 중 오류 발생");
          reject(error);
        } else {
          console.log("데이터가 성공적으로 업데이트되었습니다.");
          resolve(result);
        }
      });
    });
  }

  updateFreq(freq: any): Promise<any> {
    const query = `update accountlist set pwd_change_freq = ${freq}`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.log("데이터 업데이트 중 오류 발생");
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getUserFreqAndPri(username:any):Promise<any> {
    const query = `select pwd_change_freq as freq from accountlist where username = '${username}'`;
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

export default ProfileService;
