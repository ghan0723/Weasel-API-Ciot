var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const fs = require('fs');

//JSON 파일 읽기
let rawdata = fs.readFileSync('connection.json');
let config = JSON.parse(rawdata);

let mysql = require('mysql');

let connection = mysql.createConnection({
  host: config.HOST,
  user : config.USER,
  password : config.password,
  database : config.SCHEMA
});

connection.connect();
module.exports = connection;

//미들웨어 전부 ok임 -> 전부 말고 특정 주소만
const corsOptions = {
  origin : 'http://localhost:3000',
  methods : 'GET, HEAD, PUT, PATCH,POST,DELETE'
}
app.use('/api/data', cors(corsOptions));
// app.use('/');

app.get('/api/data', (req, res) => {
  connection.query('select * from detectfiles', (err, rows, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }

    // rows를 JSON 문자열로 변환하여 클라이언트에게 전달
    res.send(rows);
  });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
