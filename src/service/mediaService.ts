import connection from '../db/db';

class MediaService {

    getMediaAll(): Promise<any>{
        return new Promise((resolve, reject) => {
            const query = "select count(*) as allmedias from detectmediafiles where time Like '%2023-10-10%'";
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

export default MediaService;