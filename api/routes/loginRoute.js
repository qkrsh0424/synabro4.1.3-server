const express = require('express');
const router = express();
const cipher = require('../../handler/security');
const connect = require('../../database/database');

router.post('/',function(req,res){
    const user_email = cipher.encrypt(req.body.user_email);

    if(user_email){
        let sql = 'SELECT * FROM user WHERE user_email=?';
        let params = [user_email];
        connect.query(sql, params, function(err, rows, fields){
            const user_password = cipher.makeEncryptPassword(req.body.user_password, rows[0].user_salt);
            if(rows[0].user_password === user_password){
                req.session.user = {user_id:rows[0].user_id, user_nickname: rows[0].user_nickname, user_email: rows[0].user_email}
                res.status(201).json({message:'success', sessid: req.sessionID, user_id:rows[0].user_id, user_nickname:rows[0].user_nickname});
            }else{
                res.status(201).json({message:'failure'});
            }
        });
    }else{
        res.status(201).json({message:'failure, empty email'});
    }
});

module.exports = router;