import connection from "../db/db";

class NoticeService {
  getPopNotice(): Promise<any> {
    const query = 'select description from popupnotice';
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default NoticeService;
