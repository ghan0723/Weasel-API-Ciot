import path from "path";
import fs from "fs/promises";

class LogService {
  // 사용 가능한 년도 목록을 가져오는 함수
  async getYears(): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, 'logs');
      let years = await fs.readdir(logsPath);
       // 정렬: 최근 년도가 먼저 오도록 역순으로 정렬
       years = years.sort((a, b) => b.localeCompare(a));
      return years;
    } catch (error) {
      console.error(error);
      throw new Error('내부 서버 오류');
    }
  }

  // 특정 년도에 대한 사용 가능한 월 목록을 가져오는 함수
  async getMonths(year: string): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, 'logs', year);
      const months = await fs.readdir(logsPath);
      return months;
    } catch (error) {
      console.error(error);
      throw new Error('내부 서버 오류');
    }
  }

  // 특정 년도와 월에 대한 로그 파일 목록을 가져오는 함수
  async getLogFiles(year: string, month: string): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, 'logs', year, month);
      const files = await fs.readdir(logsPath);
      return files;
    } catch (error) {
      console.error(error);
      throw new Error('내부 서버 오류');
    }
  }

  // 특정 년도, 월, 일자에 대한 로그 내용을 가져오는 함수
  async getLogContent(year: string, month: string, file: string): Promise<string> {
    try {
      const projectRoot = process.cwd();
      const filePath = path.join(projectRoot, 'logs', year, month, file);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(error);
      throw new Error('내부 서버 오류');
    }
  }
}

export default LogService;
