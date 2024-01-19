import connection from "../db/db";


class SettingService {
    addAgentSetting():Promise<any> {
        return new Promise((resolve, reject) => {
            connection
        })
    }

    modAgentSetting():Promise<any> {
        return new Promise((resolve, reject) => {
            connection
        })
    }

    getAgentSetting():Promise<any> {
        return new Promise((resolve, reject) => {
            connection
        })
    }

    addServerSetting(server:{serverPort:string, ret:string, auto:boolean}):Promise<any> {
        const query = "";
        return new Promise((resolve, reject) => {
            connection.query(query, ((resolve, reject) => {
                
            }))
        })
    }

    modServerSetting():Promise<any> {
        return new Promise((resolve, reject) => {
            connection
        })
    }

    getServerSetting():Promise<any> {
        return new Promise((resolve, reject) => {
            connection
        })
    }
}

export default SettingService;