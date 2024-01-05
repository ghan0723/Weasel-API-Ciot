import { Connection } from "mysql";


class NetworkService {

    private connection: Connection;

    constructor(connection:Connection){
        this.connection = connection;
    }

    getCountAll(): Promise<any>{
        return new Promise((resolve, reject) => {
            const query = "SELECT COUNT(*) as allfiles FROM detectfiles WHERE time LIKE '%2023-09-04%'";
            this.connection.query(query, (error, result) => {
                if(error){
                    reject(error);
                }else{
                    resolve(result);
                }
            });
        });
    }

}

export default NetworkService;