import path from "path";
import fs from "fs/promises";

// LogService라는 클래스를 정의합니다.
class LogService {
  // getLogsData라는 비동기 메서드를 정의합니다.
  async getLogsData(): Promise<any> {
    try {
      // Node.js 프로세스의 현재 작업 디렉토리를 가져옵니다.
      const projectRoot = process.cwd();

      // 프로젝트 루트를 기준으로 'logs' 디렉토리의 절대 경로를 생성합니다.
      const logsPath = path.join(projectRoot, 'logs');

      // 'logs' 디렉토리의 내용을 읽어옵니다. 여기에는 각 년도의 하위 디렉토리가 포함되어 있어야 합니다.
      const years = await fs.readdir(logsPath);
      console.log("years : ", years);
      // Promise.all을 사용하여 각 년도를 비동기적으로 처리합니다.
      const logsData = await Promise.all(
        years.map(async (year) => {
          // 현재 년도의 하위 디렉토리의 절대 경로를 생성합니다.
          const yearPath = path.join(logsPath, year);

          // 년도 하위 디렉토리의 내용을 읽어옵니다. 여기에는 각 월의 하위 디렉토리가 포함되어 있어야 합니다.
          const months = await fs.readdir(yearPath);

          // Promise.all을 사용하여 현재 년도의 각 월을 비동기적으로 처리합니다.
          const yearData = await Promise.all(
            months.map(async (month) => {
              // 현재 년도의 월 하위 디렉토리의 절대 경로를 생성합니다.
              const monthPath = path.join(yearPath, month);

              // 월 하위 디렉토리의 내용을 읽어옵니다. 여기에는 로그 파일이 포함되어 있어야 합니다.
              const files = await fs.readdir(monthPath);

              // Promise.all을 사용하여 현재 월의 각 로그 파일을 비동기적으로 처리합니다.
              const monthData = await Promise.all(
                files.map(async (file) => {
                  // 현재 로그 파일의 절대 경로를 생성합니다.
                  const filePath = path.join(monthPath, file);

                  // 로그 파일의 내용을 UTF-8로 인코딩된 문자열로 읽어옵니다.
                  const content = await fs.readFile(filePath, 'utf-8');

                  // 로그 파일 이름과 내용을 포함하는 객체를 반환합니다.
                  return { file, content };
                })
              );

              // 현재 월과 해당 월의 처리된 로그 데이터를 포함하는 객체를 반환합니다.
              return { month, data: monthData };
            })
          );

          // 현재 년도와 해당 년도의 처리된 로그 데이터를 포함하는 객체를 반환합니다.
          return { year, data: yearData };
        })
      );

      // 전체 처리된 로그 데이터를 반환합니다.
      return logsData;
    } catch (error) {
      // 프로세스 중에 발생한 모든 에러를 처리합니다.
      console.error(error);

      // 내부 서버 오류가 발생했음을 나타내는 새로운 에러를 throw합니다.
      throw new Error('Internal Server Error');
    }
  }
}

export default LogService;
