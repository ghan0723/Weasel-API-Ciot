import connection from "../db/db";

class ProfileService {
  getProfile(username: any): Promise<any> {
    const query =
      "select username, password, privilege, pwd_change_freq from accountlist where username = ? ";
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
    user: { username: string; password: string },
    oldname: any
  ): Promise<any> {
    const query = `UPDATE accountlist SET username = '${user.username}', password = '${user.password}' WHERE username = '${oldname}'`;

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

  updateFreq(freq: any): Promise<any> {
    const query = `update accountlist set pwd_change_freq = ${freq}`;
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
