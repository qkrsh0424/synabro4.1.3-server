const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');

router.post('/get_profile',function(req,res){
    if(req.session.user){
        let sql = `
            SELECT user_uid, user_email, user_job, user_name, user_nickname,user_major FROM user WHERE user_id=?;
        `;
        let params = [req.session.user.user_id];
        connect.query(sql, params, function(err, rows, fields){
            if(err){
                res.status(500).error('데이터 에러');
            }else{
                let result = {
                    message : 'getSuccess',
                    user : {
                        UID : cipher.decrypt(rows[0].user_uid),
                        Email : cipher.decrypt(rows[0].user_email),
                        Nickname : rows[0].user_nickname,
                        Job : rows[0].user_job,
                        Name : cipher.decrypt(rows[0].user_name),
                        Major : rows[0].user_major
                    }
                }
                res.status(201).json(result);
            }
        });
    }
});

module.exports = router;