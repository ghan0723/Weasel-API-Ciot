import connection from "../db/db";

class PrintService{

    getCountAll():Promise<any>{

        return new Promise((resolve, reject) => {
            const query = "select count(*) as allprints from detectprinteddocuments where time like '%2022-07-19%'";
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

export default PrintService;