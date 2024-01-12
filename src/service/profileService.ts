import connection from "../db/db";


class ProfileService {

    getProfile(username:string): Promise<any> {

        const query = "select username, passwd, grade, mng_ip_ranges from userlist where username = ? ";

        return new Promise((resolve, reject) => {
            connection.query(query, username, (error, result) => {
                if(error){
                    reject(error);
                }else{
                    resolve(result);
                }
            })
        })
    }

}

export default ProfileService;