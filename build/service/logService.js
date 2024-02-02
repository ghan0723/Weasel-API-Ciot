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
class LogService {
    // 사용 가능한 년도 목록을 가져오는 함수
    getYears() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRoot = process.cwd();
                const logsPath = path_1.default.join(projectRoot, 'logs');
                let years = yield promises_1.default.readdir(logsPath);
                // 정렬: 최근 년도가 먼저 오도록 역순으로 정렬
                years = years.sort((a, b) => b.localeCompare(a));
                return years;
            }
            catch (error) {
                console.error(error);
                throw new Error('내부 서버 오류');
            }
        });
    }
    // 특정 년도에 대한 사용 가능한 월 목록을 가져오는 함수
    getMonths(year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRoot = process.cwd();
                const logsPath = path_1.default.join(projectRoot, 'logs', year);
                const months = yield promises_1.default.readdir(logsPath);
                return months;
            }
            catch (error) {
                console.error(error);
                throw new Error('내부 서버 오류');
            }
        });
    }
    // 특정 년도와 월에 대한 로그 파일 목록을 가져오는 함수
    getLogFiles(year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRoot = process.cwd();
                const logsPath = path_1.default.join(projectRoot, 'logs', year, month);
                const files = yield promises_1.default.readdir(logsPath);
                return files;
            }
            catch (error) {
                console.error(error);
                throw new Error('내부 서버 오류');
            }
        });
    }
    // 특정 년도, 월, 일자에 대한 로그 내용을 가져오는 함수
    getLogContent(year, month, file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRoot = process.cwd();
                const filePath = path_1.default.join(projectRoot, 'logs', year, month, file);
                const content = yield promises_1.default.readFile(filePath, 'utf-8');
                return content;
            }
            catch (error) {
                console.error(error);
                throw new Error('내부 서버 오류');
            }
        });
    }
}
exports.default = LogService;
