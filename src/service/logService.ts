import connection from "../db/db";

class LogService {
  getR(): Promise<any> {
    return new Promise((resolve, reject) => {
      connection
    });
  }
}

export default LogService;
