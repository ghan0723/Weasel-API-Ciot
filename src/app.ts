import { NextFunction, Request, Response } from "express";
import { frontIP } from "./interface/ipDomain";

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const cors = require("cors");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/userRouter.js");
var profileRouter = require('./routes/profileRouter.js');
var settingRouter = require('./routes/settingRouter.js');
var logRouter = require('./routes/logRouter.js');

var app = express();
const fs = require("fs");

// 파일 업데이트 디렉터리 생성
try {
  const directoryPath  = 'C:/ciot/updates';
  if(!fs.existsSync(directoryPath )) {
    fs.mkdirSync(directoryPath , { recursive: true });
  }
} catch (err) {
  console.error(err);
}



//JSON 파일 읽기
let rawdata = fs.readFileSync("connection.json");
let config = JSON.parse(rawdata);

let mysql = require("mysql");

let connection = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.password,
  database: config.SCHEMA,
});

connection.connect();
app.locals.connection = connection; // connection 객체를 app.locals에 저장

//미들웨어 전부 ok임 -> 전부 말고 특정 주소만
const corsOptions = {
  origin: [
    // ... //
    `${frontIP}`,
    process.env.CALLBACK_URL || "",
  ],
  credentials: true,
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  exposedHeaders: ["set-cookie"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
};
app.use(cors(corsOptions));
// app.use('/');

// local
app.use('/Detects',express.static('C:/Program Files (x86)/ciot/WeaselServer/Temp'));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use('/profile', profileRouter);
app.use('/setting', settingRouter);
app.use('/log', logRouter);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  if (!isNaN(+err.message)) {
    res.status(+err.message);
  } else {
    res.status(500);
  }
});

module.exports = app;
