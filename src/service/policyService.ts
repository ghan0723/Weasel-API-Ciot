import connection from "../db/db";

class PolicyService {
  getPolicyList(): Promise<any> {
    const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (result) {
          if (result.length === 0) {
            result = [
              {
                name: " ",
                distinction: " ",
                author: " ",
              },
            ];
          }
          resolve(result);
        } else {
          reject(error);
        }
      });
    });
  }

  postTcUpload(): Promise<any> {
    const query = ``;
    return new Promise((resolve, reject) => {});
  }

  getTestCases(): Promise<any> {
    let query = `select * from testcases`;
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

  getTCByPName(name: any): Promise<any> {
    let query = `select * from tc_policy where p_name = ${name}`;
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

  getInsertSessions(username: any, policyname: any): Promise<any> {
    const query = `insert into sessions (username, p_name, s_name, s_time, s_response, s_log) values ('${username}', '${policyname}', now(), '', '{}', '{}');`;

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
}

export default PolicyService;
