// userService.js

class userService {

    constructor(connection) {
        this.connection = connection;
    }

    async getUserByUsernameAndPasswd(username, passwd) {
        const query = 'select username, grade, enabled, mng_ip_ranges from userlist where username = ?, passwd = ?';
        const [user] = await this.connection.query(query, [username, passwd]);
        console.log('user(service) : ', user);
        return user;
    }
}

module.exports = userService;