import { IpRange } from "../interface/interface";
import connection from "../db/db";
import IpCalcService from "./ipCalcService";

class UserService {
  //로그인 시 계정 정보 가져오기
  getLogin(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `SELECT username, password, privilege, enabled, fail_count FROM accountlist WHERE username = '${username}'`;
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  removeUser(users: string[]): Promise<any> {
    // 이 부분에서 배열을 문자열로 변환할 때 각 값에 작은따옴표를 추가하는 방식으로 수정
    const usernameString = users.map((username) => `'${username}'`).join(", ");

    // IN 절을 괄호로 감싸고 수정
    const query = `DELETE FROM accountlist WHERE username IN (${usernameString})`;

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

  getPrivilege(username: any): Promise<any> {
    const query = `select privilege from accountlist where username = ? `;

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

  checkUsername(username: any, oldname?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (username !== oldname) {
        const query =
          "SELECT COUNT(*) as count FROM accountlist WHERE username = ?";
        connection.query(query, [username], (error, result) => {
          if (error) {
            reject(error);
          } else {
            const isDuplicate = result[0].count > 0;
            if (isDuplicate) {
              resolve({
                exists: true,
                message: "이미 사용 중인 계정명입니다.",
              });
            } else {
              resolve({ exists: false, message: "사용 가능한 계정명입니다." });
            }
          }
        });
      } else {
        resolve({ exists: false, message: "현재 계정명과 동일합니다." });
      }
    });
  }

  checkPwdFreq(username: any): Promise<boolean> {
    const query = `SELECT last_pwd_date, pwd_change_freq FROM accountlist WHERE username = ?`;

    return new Promise((resolve, reject) => {
      connection.query(query, [username], (error, result) => {
        if (error) {
          reject(error.fatal);
        } else {
          if (result.length > 0) {
            const lastPwdDate = new Date(result[0].last_pwd_date);
            const pwdChangeFreq = result[0].pwd_change_freq;

            // 비밀번호 변경 주기를 날짜로 계산
            const nextChangeDate = new Date(lastPwdDate);
            const month = lastPwdDate.getMonth() + parseInt(pwdChangeFreq);
            
            nextChangeDate.setMonth(month);
            
            // 현재 날짜와 다음 변경 날짜를 비교
            const currentDate = new Date();
            
            if (currentDate > nextChangeDate) {
              // 현재 날짜가 다음 변경 날짜를 넘었으면 true 반환
              resolve(true);
            } else {
              // 현재 날짜가 다음 변경 날짜를 넘지 않았으면 false 반환
              resolve(false);
            }
          } else {
            // 해당 username의 레코드가 없는 경우도 처리할 수 있습니다.
            reject("User not found");
          }
        }
      });
    });
  }

  getPwdByUsername(username: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = "select password from accountlist where username = ?";
      connection.query(query, [username], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  modifyPwdByFreq(username: any, encPwd: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const query =
        "update accountlist set password = ? , last_pwd_date = now() where username = ?";
      connection.query(query, [encPwd, username], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getFreq(): Promise<any> {
    return new Promise((resolve, reject) => {
      const query = `select distinct(pwd_change_freq) as freq from accountlist;`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  disabledUser(username: any, fail_count: any): Promise<any> {
    let query = "";
    if (fail_count >= 5) {
      query = `update accountlist set enabled = 0, fail_count = 0 where username = '${username}'`;
    } else {
      query = `update accountlist set fail_count = ${fail_count} where username = '${username}'`;
    }
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

  failCountDefault(username: any): Promise<any> {
    const query = `update accountlist set fail_count = 0 where username = '${username}'`;
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

  getUser(username:any): Promise<any>{
    const query = `select * from accountlist where username = '${username}'`;
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

  getUserList(privilege:any, category:any, searchWord:any): Promise<any> {
    let searchCondition = "";
    if(searchWord !== "" && category !== ""){
      //검색 조건이 존재한다.
      switch (category){
        //카테고리가 사용자명일 때
        case "username" :
          searchCondition = `where username like '%${searchWord}%'`;
          break;
        //카테고리가 등급일때
        case "privilege" : 
        if(
          /(유저|유|저)/i.test(searchWord)
        ) {
          searchCondition = `where privilege = 2`;
        } else {
          searchCondition = `where privilege = '${searchWord}`;
        }
        break;
        case "enabled":
          if (/(비활성화|비|비활|비활성|비화|비활화)/i.test(searchWord)) {
            searchCondition = `where enabled = 0`;
          } else if (/(활성화|활|활성|성화|활화|성|화)/i.test(searchWord)) {
            searchCondition = `where enabled = 1`;
          } else {
            searchCondition = `where enabled = '${searchWord}'`;
          }
          break;
      }
    }
    const query = `select username, privilege, enabled from accountlist where privilege > ${privilege}`;
    return new Promise((resolve, reject) => {
      const query2 = `select username, privilege, enabled from (${query}) as userTable ${searchCondition}`;
      connection.query(query2, (error, result) => {
        if(error){
          reject(error);
        } else {
          let users = [];
          for(const user of result){
            users.push({
              username:user?.username,
              privilege:user?.privilege,
              enabled:user?.enabled
            })
          }
          resolve(users);
        }
      })
    })
  }

  addUser(user:{username:any, password:any, privilege:any, freq:any}):Promise<any>{
    const query = `insert into accountlist (username, password, privilege, enabled, last_pwd_date, pwd_change_freq)`+
    ` values ('${user.username}', '${user.password}', ${user.privilege}, 1, now(), ${user.freq})`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  modifyUser(user:{username:any, password:any, privilege:any, enabled:any, freq:any}, oldname:any):Promise<any> {
    let query = '';
    if(user.freq){
      query = `update accountlist set username = '${user.username}', password = '${user.password}', privilege = ${user.privilege}, enabled = ${user.enabled}, last_pwd_date = now() where username = '${oldname}'`;
    } else {
      query = `update accountlist set username = '${user.username}', password = '${user.password}', privilege = ${user.privilege}, enabled = ${user.enabled} where username = '${oldname}'`;
    }
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }
}

export default UserService;
