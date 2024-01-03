var express = require('express');
var router = express.Router();
    
router.post('/login', function(req, res){
    
    let {username, passwd} = req.body;
    console.log("data(req.body) : ", req.body);

    const connection = req.app.locals.connection;

    connection.query('select username, grade, enabled, mng_ip_ranges from userlist where username = ? AND passwd = ?', [username, passwd], (err, rows) => {
        if(err){
            console.error('에러 발생 : ', err);
            return res.status(500).send('fucking');
        }
        console.log("rows : ",rows);

        if (rows.length > 0) {
            // 로그인 성공 시 프론트엔드로 리다이렉트
            res.redirect("http://localhost:3000/admin/default");
            // res.send(rows);
        } else {
            // 로그인 실패 시 다른 처리
            res.status(401).send('Unauthorized');
        }
    })
})

module.exports = router;