import { Connection } from "mysql";

class NetworkService {
  private connection: Connection;
  private query1!: number;
  private query2!: number;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private columnAlias:any = {
    // alias    table명
    'id' : 'id',                  // 0
    'Accurancy' : 'accuracy',     // 1
    'Time' : 'time',              // 2
    'PcName' : 'pcname',          // 3
    'Agent_ip' : 'agent_ip',      // 4
    'SrcIp' : 'src_ip',           // 5
    'SrcPort' : 'src_port',       // 6
    'DstIp' : 'dst_ip',           // 7
    'DstPort' : 'dst_port',       // 8
    'Process' : 'process',        // 9
    'PIDs' : 'pid',               // 10
    'SrcFile' : 'src_file',       // 11
    'DownLoading' : 'saved_file', // 12
    'ScreenShots' : 'saved_file', // 13
    'FileSizes' : 'file_size',    // 14
    'Keywords' : 'keywords',      // 15
    'DestFiles' : 'dst_file'      // 16
  };

  getCountAll(select:string): Promise<any> {

    let dayOption1:string;
    let dayOption2:string;

    if(select === 'day'){
      dayOption1 = 'CURDATE(), INTERVAL 0 DAY';
      dayOption2 = 'CURDATE(), INTERVAL 1 DAY';
    }else if(select === 'week'){
      dayOption1 = 'CURDATE(), INTERVAL 1 WEEK'
      dayOption2 = 'CURDATE(), INTERVAL 2 WEEK'
    }else{
      dayOption1 = 'CURDATE(), INTERVAL 1 MONTH'
      dayOption2 = 'CURDATE(), INTERVAL 2 MONTH'
    }

    return new Promise((resolve, reject) => {
      const query3 =
        `SELECT COUNT(*) as allfiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption1})`;
      const query4 =
        `SELECT COUNT(*) as beforefiles FROM detectfiles WHERE time >= DATE_SUB(${dayOption2}) AND time < DATE_SUB(${dayOption1})`;

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
              innerResolve(); // 빈 인수로 호출
            }
          });
        }),
         
      ])
        .then(() => {
          resolve({
            allfiles: this.query1,
            beforefiles:
            (this.query2 !== 0) ? (((this.query1 - this.query2) / this.query2) * 100).toFixed(2) : (this.query1 / 1 * 100).toFixed(2),
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getApiData(page:any,pageSize:any,sorting:any,desc:any,category:any,search:any): Promise<any>{
    let queryPage:number=0;
    let queryPageSize:number=0;
    let querySorting:string=sorting === '' ? 'time' : sorting;
    let queryDesc:string=desc === 'false' ? 'asc' : 'desc';
    let whereClause = '';
    const aliasKey = Object.keys(this.columnAlias);
    const convertColumns = category !== '' && this.columnAlias[category];

    if(page !== undefined) {      
      queryPage = Number(page);
    }

    if(pageSize !== undefined) {
      queryPageSize = Number(pageSize);
    }

    if(sorting === '' && desc === '') {
      sorting = 'time';
      desc = 'desc';
    }

    if(search !== '') {
      whereClause = 'where ' + convertColumns + " like ?";
    }

    return new Promise((resolve, reject) => {
      const query = 
        `select id, accuracy as ${aliasKey[1]}, time as ${aliasKey[2]}, pcname as ${aliasKey[3]}, agent_ip as ${aliasKey[4]}, src_ip as ${aliasKey[5]}, ` +
        `src_port as ${aliasKey[6]}, dst_ip as ${aliasKey[7]}, dst_port as ${aliasKey[8]}, process as ${aliasKey[9]}, ` +
        `pid as ${aliasKey[10]}, src_file as ${aliasKey[11]}, saved_file as ${aliasKey[12]}, saved_file as ${aliasKey[13]}, ` +
        `keywords as ${aliasKey[15]}, dst_file as ${aliasKey[16]} ` +
        'from detectfiles ' + 
         whereClause +
        ' order by '+ querySorting + ' ' + queryDesc + ' ' +
        'LIMIT ' + queryPageSize + ' offset ' + queryPage*queryPageSize;

      const query2 = 'select count(*) as count from detectfiles ' + whereClause;
      const whereQuery = '%' + search + '%';      

      Promise.all([
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query, whereQuery, (error, result) => {

            // 검색 결과가 없을 경우의 처리
            if(result.length === 0) {
              result[0] = aliasKey.reduce((obj:any, key:any) => {
                obj[key] = '';
                return obj;
              }, {});
            }
            
            if (error) {
              innerReject(error);
            } else {
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
        new Promise<void>((innerResolve, innerReject) => {
          this.connection.query(query2, whereQuery, (error, result) => {
            if(result[0].count === 0) {
              result[0].count = 1;
            }
            
            if (error) {
              innerReject(error);
            } else {
              innerResolve(result); // 빈 인수로 호출
            }
          });
        }),
      ])
      .then(values => {
        
        resolve(values);
      })
      .catch(error => {
        return reject(error)
      });

    })
  };
}

export default NetworkService;
