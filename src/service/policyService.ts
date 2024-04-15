import connection from "../db/db";

class PolicyService {
    getPolicyList():Promise<any> {

        const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;

        return new Promise((resolve,reject) => {
            connection.query(query, (error,result) => {
                if(result) {
                    if(result.length === 0) {
                        result = [{
                            name : ' ',
                            distinction : ' ',
                            author : ' '
                        }];
                    }
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }

    postTcUpload():Promise<any> {
        const query = ``;
        return new Promise((resolve, reject) => {

        })
    }

}

export default PolicyService;