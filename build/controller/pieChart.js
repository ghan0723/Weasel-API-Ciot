"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var router = express.Router();
router.get('/count', function (req, res) {
    let data = [];
    const connection = req.app.locals.connection;
    connection.query('select process, count(process) as count from detectfiles group by process', (err, rows) => {
        if (err) {
            console.error('에러 발생 : ', err);
            return res.status(500).send('fucking');
        }
        console.log("rows : ", rows);
        connection.query('select count(*) totalCount  from detectfiles', (err2, row2) => {
            if (err2) {
                console.error("두번째 쿼리에서 에러 발생 :", err2);
                return res.status(500).send('fucking');
            }
            console.log('row2[0] : ', row2);
            for (let index = 0; index < rows.length; index++) {
                let count = (rows[index].count / row2[0].totalCount) * 100;
                console.log('hcount : ', count);
                data.push({
                    process: rows[index].process,
                    count: rows[index].count,
                    hcount: Math.floor(count),
                    day: index
                });
            }
            data.sort((a, b) => b.count - a.count);
            res.send(data);
        });
    });
});
module.exports = router;
