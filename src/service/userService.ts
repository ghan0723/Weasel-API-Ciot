import { Connection, OkPacket } from "mysql";

class UserService {
    private connection: Connection;

    constructor(connection: Connection){
        this.connection = connection;
    }

    getUser(username: string, passwd: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = 'SELECT username, grade, enabled, mng_ip_ranges FROM userlist WHERE username = ? AND passwd = ?';
            this.connection.query(query, [username, passwd], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getUserList(grade:number): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = `select username, grade, enabled, mng_ip_ranges from userlist where grade > ${grade}`;
            this.connection.query(query, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
        })
    }
}

export default UserService;
