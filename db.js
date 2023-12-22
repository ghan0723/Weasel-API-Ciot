let mysql = require('mysql');
let rawdata = fs.readFileSync('connection.json');
let config = JSON.parse(rawdata);
const fs = require('fs');