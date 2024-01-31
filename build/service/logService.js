"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// LogService라는 클래스를 정의합니다.
class LogService {
    // getLogsData라는 비동기 메서드를 정의합니다.
    getLogsData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Node.js 프로세스의 현재 작업 디렉토리를 가져옵니다.
                const projectRoot = process.cwd();
                // 프로젝트 루트를 기준으로 'logs' 디렉토리의 절대 경로를 생성합니다.
                const logsPath = path_1.default.join(projectRoot, 'logs');
                // 'logs' 디렉토리의 내용을 읽어옵니다. 여기에는 각 년도의 하위 디렉토리가 포함되어 있어야 합니다.
                const years = yield promises_1.default.readdir(logsPath);
                console.log("years : ", years);
                // Promise.all을 사용하여 각 년도를 비동기적으로 처리합니다.
                const logsData = yield Promise.all(years.map((year) => __awaiter(this, void 0, void 0, function* () {
                    // 현재 년도의 하위 디렉토리의 절대 경로를 생성합니다.
                    const yearPath = path_1.default.join(logsPath, year);
                    // 년도 하위 디렉토리의 내용을 읽어옵니다. 여기에는 각 월의 하위 디렉토리가 포함되어 있어야 합니다.
                    const months = yield promises_1.default.readdir(yearPath);
                    // Promise.all을 사용하여 현재 년도의 각 월을 비동기적으로 처리합니다.
                    const yearData = yield Promise.all(months.map((month) => __awaiter(this, void 0, void 0, function* () {
                        // 현재 년도의 월 하위 디렉토리의 절대 경로를 생성합니다.
                        const monthPath = path_1.default.join(yearPath, month);
                        // 월 하위 디렉토리의 내용을 읽어옵니다. 여기에는 로그 파일이 포함되어 있어야 합니다.
                        const files = yield promises_1.default.readdir(monthPath);
                        // Promise.all을 사용하여 현재 월의 각 로그 파일을 비동기적으로 처리합니다.
                        const monthData = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                            // 현재 로그 파일의 절대 경로를 생성합니다.
                            const filePath = path_1.default.join(monthPath, file);
                            // 로그 파일의 내용을 UTF-8로 인코딩된 문자열로 읽어옵니다.
                            const content = yield promises_1.default.readFile(filePath, 'utf-8');
                            // 로그 파일 이름과 내용을 포함하는 객체를 반환합니다.
                            return { file, content };
                        })));
                        // 현재 월과 해당 월의 처리된 로그 데이터를 포함하는 객체를 반환합니다.
                        return { month, data: monthData };
                    })));
                    // 현재 년도와 해당 년도의 처리된 로그 데이터를 포함하는 객체를 반환합니다.
                    return { year, data: yearData };
                })));
                // 전체 처리된 로그 데이터를 반환합니다.
                return logsData;
            }
            catch (error) {
                // 프로세스 중에 발생한 모든 에러를 처리합니다.
                console.error(error);
                // 내부 서버 오류가 발생했음을 나타내는 새로운 에러를 throw합니다.
                throw new Error('Internal Server Error');
            }
        });
    }
}
exports.default = LogService;
