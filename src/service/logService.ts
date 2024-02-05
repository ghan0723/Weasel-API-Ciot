import path from "path";
import fs from "fs/promises";

class LogService {
  // 사용 가능한 년도 목록을 가져오는 함수
  async getYears(): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, "logs");
      let years = await fs.readdir(logsPath);
      // 정렬: 최근 년도가 먼저 오도록 역순으로 정렬
      years = years.sort((a, b) => b.localeCompare(a));
      return years;
    } catch (error) {
      console.error(error);
      throw new Error("내부 서버 오류");
    }
  }

  // 특정 년도에 대한 사용 가능한 월 목록을 가져오는 함수
  async getMonths(year: any): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, "logs", year);
      const months = await fs.readdir(logsPath);
      // - 뒤에 있는 부분만 가져오기 (이부분은 고민좀...)
      const simplifiedMonths = months.map((month) => month.split("-")[1]);
      return simplifiedMonths;
      // return months;
    } catch (error) {
      console.error(error);
      throw new Error("내부 서버 오류");
    }
  }

  // 특정 년도와 월에 대한 로그 파일 목록을 가져오는 함수
  async getLogFiles(year: any, month: any): Promise<string[]> {
    try {
      const projectRoot = process.cwd();
      const logsPath = path.join(projectRoot, "logs", year, year + "-" + month);
      const files = await fs.readdir(logsPath);
      // .log 확장자 제거
      const filesWithoutExtension = files.map((file) =>
        file.replace(".log", "")
      );
      return filesWithoutExtension;
    } catch (error) {
      console.error(error);
      throw new Error("내부 서버 오류");
    }
  }

  // 특정 년도, 월, 일자에 대한 로그 내용을 가져오는 함수
  async getLogContent(year: any, month: any, file: any): Promise<string> {
    try {
      const projectRoot = process.cwd();
      const filePath = path.join(projectRoot, "logs", year, year + "-" + month, file+".log");
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      console.error(error);
      throw new Error("내부 서버 오류");
    }
  }

    // 사용 가능한 년도 에러 목록을 가져오는 함수
    async getErrorYears(): Promise<string[]> {
      try {
        const projectRoot = process.cwd();
        const logsPath = path.join(projectRoot, "logs-err");
        let years = await fs.readdir(logsPath);
        // 정렬: 최근 년도가 먼저 오도록 역순으로 정렬
        years = years.sort((a, b) => b.localeCompare(a));
        return years;
      } catch (error) {
        console.error(error);
        throw new Error("내부 서버 오류");
      }
    }
  
    // 특정 년도에 대한 사용 가능한 월 목록을 가져오는 함수
    async getErrorMonths(year: any): Promise<string[]> {
      try {
        const projectRoot = process.cwd();
        const logsPath = path.join(projectRoot, "logs-err", year);
        const months = await fs.readdir(logsPath);
        // - 뒤에 있는 부분만 가져오기 (이부분은 고민좀...)
        const simplifiedMonths = months.map((month) => month.split("-")[1]);
        return simplifiedMonths;
        // return months;
      } catch (error) {
        console.error(error);
        throw new Error("내부 서버 오류");
      }
    }
  
    // 특정 년도와 월에 대한 로그 파일 목록을 가져오는 함수
    async getErrorLogFiles(year: any, month: any): Promise<string[]> {
      try {
        const projectRoot = process.cwd();
        const logsPath = path.join(projectRoot, "logs-err", year, year + "-" + month);
        const files = await fs.readdir(logsPath);
        // .log 확장자 제거
        const filesWithoutExtension = files.map((file) =>
          file.replace(".log", "")
        );
        return filesWithoutExtension;
      } catch (error) {
        console.error(error);
        throw new Error("내부 서버 오류");
      }
    }
  
    // 특정 년도, 월, 일자에 대한 로그 내용을 가져오는 함수
    async getErrorLogContent(year: any, month: any, file: any): Promise<string> {
      try {
        const projectRoot = process.cwd();
        const filePath = path.join(projectRoot, "logs-err", year, year + "-" + month, file+".log");
        const content = await fs.readFile(filePath, "utf-8");
        return content;
      } catch (error) {
        console.error(error);
        throw new Error("내부 서버 오류");
      }
    }
}

export default LogService;
