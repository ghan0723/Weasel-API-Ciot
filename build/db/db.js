"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mysql_1 = __importDefault(require("mysql"));
const fs = __importStar(require("fs"));
// 파일 읽기
const rawdata = fs.readFileSync('connection.json');
// Buffer를 문자열로 변환
const rawdataString = rawdata.toString();
// 이제 rawdataString은 문자열 형식이므로 사용 가능
const config = JSON.parse(rawdataString);
const connection = mysql_1.default.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.password,
    database: config.SCHEMA,
    charset: 'utf8mb4'
});
connection.connect(err => {
    if (err)
        throw err;
    console.log('Connected to the remote database!');
});
module.exports = connection;
