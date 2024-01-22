import mysql, { Connection } from 'mysql';
import * as fs from 'fs';

// 파일 읽기
const rawdata: Buffer = fs.readFileSync('connection.json');

// Buffer를 문자열로 변환
const rawdataString: string = rawdata.toString();

// 이제 rawdataString은 문자열 형식이므로 사용 가능
const config = JSON.parse(rawdataString);

const connection: Connection = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.password,
  database: config.SCHEMA,
  charset:'utf8mb4'
});

connection.connect();

export = connection;

