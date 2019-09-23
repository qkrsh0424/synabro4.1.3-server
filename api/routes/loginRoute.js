const express = require('express');
const router = express();
const cipher = require('../../handler/security');
const connect = require('../../database/database');

router.post('/',function(req,res){
    const user_uid = cipher.encrypt(req.body.user_uid);

    if(user_uid){
        let sql = `SELECT * FROM user`;
        connect.query(sql, function(err, row, fields){
            let invalidUID = true;
            for(let i=0; i< row.length; i++){
                if(row[i].user_uid===user_uid){
                    invalidUID = false;
                }
            }

            if(invalidUID){
                res.status(201).json({message:"failure"});
            }else{
                let sql = 'SELECT * FROM user WHERE user_uid=?';
                let params = [user_uid];
                connect.query(sql, params, function(err, rows, fields){
                    const user_password = cipher.makeEncryptPassword(req.body.user_password, rows[0].user_salt);
                    if(rows[0].user_password === user_password){
                        req.session.user = {user_id:rows[0].user_id, user_nickname: rows[0].user_nickname, user_uid: rows[0].user_uid}
                        res.status(201).json({message:'success', sessid: req.sessionID, user_id:rows[0].user_id, user_nickname:rows[0].user_nickname});
                    }else{
                        res.status(201).json({message:'failure'});
                    }
                });
            }
        });
    }else{
        res.status(201).json({message:'failure, empty ID'});
    }
});

module.exports = router;