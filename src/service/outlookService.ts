import connection from "../db/db"

class OutlookService {


    getCountAll():Promise<any>{
        return new Promise((resolve, reject) => {
            const query = "select count(*) as alloutlooks from outlookpstviewer where time like '%2022-08-17%'";
            connection.query(query, (error, result) => {
                if(error){
                    reject(error);
                }else{
                    resolve(result);
                }
            })
        })
    }

}

export default OutlookService;