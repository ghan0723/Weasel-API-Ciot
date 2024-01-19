import connection from "../db/db";

class ProfileService {
  getProfile(username: string): Promise<any> {
    const query =
      "select username, passwd, grade, mng_ip_ranges from userlist where username = ? ";

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

  modUser(user: { username: string; passwd: string }, oldname: string): Promise<any> {
    const query = `UPDATE userlist SET username = '${user.username}', passwd = '${user.passwd}' WHERE username = '${oldname}'`;

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
}

export default ProfileService;
