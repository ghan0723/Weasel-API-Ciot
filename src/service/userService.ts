import { Connection } from "mysql";

class UserService {
    private connection: Connection;

    constructor(connection: Connection){
        this.connection = connection;
    }

    async getUser(username: string, passwd: string){
        const query = 'SELECT username, grade, enabled, mng_ip_ranges FROM userlist WHERE username = ? AND passwd = ?';
        const user = await this.connection.query(query, [username, passwd]);
        console.log("user(service임) : ", user);
        return user;
    }
}

export default UserService;