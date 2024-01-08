import connection from "../db/db";

class BarService {
  getBarData(props: any): Promise<any> {
    let table:string;
    if (props === 'network') {
        table = 'detectfiles';
    }else if(props === 'media'){
        table = 'detectmediafiles';
    }else if(props === 'outlook'){
        table = 'outlookpstviewer';
    }else{
        table = 'detectprinteddocuments';
    }
    let query = `select agent_ip, count(distinct id) as totalCount from ${table} 
        where DATE(time) = CURDATE() group by agent_ip order by totalCount desc limit 10`;

    return new Promise<any>((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // 가공된 데이터 생성
          const data = result.map((item: any) => ({
            agentip: item.agent_ip,
            totalCount: item.totalCount,
          }));
          // 최종 결과물 반환
          console.log("bar data : ", data);
          resolve({
            table: props,
            data: data,
          }); 
        }
      });
    });
  }
}

export default BarService;
