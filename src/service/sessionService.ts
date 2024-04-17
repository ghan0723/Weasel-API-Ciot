import connection from "../db/db";

class SessionService {
  getSessionList(category: any, searchWord: any): Promise<any> {
    let searchCondition = "";
    if (searchWord !== "" && category !== "") {
      switch (category) {
        //카테고리가 번호일 때
        case "s_id":
          searchCondition = `where s_id like '%${searchWord}%'`;
          break;
        //카테고리가 사용자명일 때
        case "username":
          searchCondition = `where username like '%${searchWord}%'`;
          break;
        //카테고리가 점검 정책명일 때
        case "p_name":
          searchCondition = `where p_name like '%${searchWord}%'`;
          break;
        //카테고리가 세션명일 때
        case "s_name":
          searchCondition = `where s_name like '%${searchWord}%'`;
          break;
        case "s_time":
          searchCondition = `where p_name like '%${searchWord}%'`;
          break;
      }
    }
    const query = `select * from sessions ${searchCondition} order by s_name DESC`;
    return new Promise((resolve, reject) => {
        connection.query(query, (error, result) => {
            if(error){
                reject(error);
            } else {
                let sessions = [];
                for(const session of result){
                    sessions.push({
                        s_id:session?.s_id,
                        s_name:session?.s_name,
                        p_name:session?.p_name,
                        username:session?.username,
                        s_time:session?.s_time,
                    })
                }
                resolve(sessions);
            }
        })
    });
  }

  // session 클릭시 상세 내역
  getSessionData(s_id: any): Promise<any> {

    const query = `select * from sessions where s_id = ?`;
    return new Promise((resolve, reject) => {
        connection.query(query, s_id, (error, result) => {
            if(error){
              reject(error);
            } else {
              let sessionDatas = [{
                s_id:'',
                username:'',
                p_name:'',
                s_name:'',
                s_time:'',
                s_response:'',
                s_log:'',
              }];
              if(result.length > 0){
                resolve(result);
              } else {
                resolve(sessionDatas);
              }
            }
        })
    });
  }

  // session 삭제
  deleteSession(s_id:any): Promise<any> {
    const query = `delete from sessions where s_id = '${s_id}'`;
    return new Promise((resolve, reject) => {
        connection.query(query, (error, result) => {
            if(error){
                reject(error);
            } else {
                resolve(result);
            }
        })
    });
  }
}

export default SessionService;
