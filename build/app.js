"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipDomain_1 = require("./interface/ipDomain");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users.js");
var pieChartRouter = require("./routes/pieChartRouter.js");
var userRouter = require("./routes/userRouter.js");
var networkRouter = require("./routes/networkRouter.js");
var mediaRouter = require("./routes/mediaRouter.js");
var outlookRouter = require("./routes/outlookRouter.js");
var printRouter = require("./routes/printRouter.js");
var barRouter = require("./routes/barRouter.js");
var apiRouter = require("./routes/apiRouter.js");
var profileRouter = require('./routes/profileRouter.js');
var settingRouter = require('./routes/settingRouter.js');
var excelRouter = require('./routes/excelRouter.js');
const lineChartsRouter = require("./routes/lineChartsRouter.js");
var app = express();
const fs = require("fs");
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
        `${ipDomain_1.frontIP}`,
        process.env.CALLBACK_URL || "",
    ],
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    exposedHeaders: ["set-cookie"],
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
};
app.use(cors(corsOptions));
// app.use('/');
app.get("/api/detectfiles", (req, res) => {
    connection.query("select * from detectfiles", (err, rows) => {
        if (err) {
            console.error("Error executing query:", err);
            // return res.status(500).send('Internal Server Error');
            return res.status(500).json("Internal Server Error");
        }
        // rows를 JSON 문자열로 변환하여 클라이언트에게 전달
        res.send(rows);
    });
});
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/pie", pieChartRouter);
app.use("/user", userRouter);
app.use("/network", networkRouter);
app.use("/media", mediaRouter);
app.use("/outlook", outlookRouter);
app.use("/print", printRouter);
app.use("/bar", barRouter);
app.use("/api", apiRouter);
app.use('/profile', profileRouter);
app.use('/setting', settingRouter);
app.use('/excel', excelRouter);
app.use("/lineCharts", lineChartsRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    if (!isNaN(+err.message)) {
        res.status(+err.message);
    }
    else {
        res.status(500);
    }
});
module.exports = app;
