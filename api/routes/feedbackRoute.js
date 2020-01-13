const express = require('express');
const router = express();
const connect = require('../../database/database');

const cipher = require('../../handler/security');

var redis = require('redis'),
    client = redis.createClient();

const corsCheck = require('../../config/corsCheck');

router.use(function (req, res, next) { //1
    // if(req.headers.authorization){
        if(corsCheck.checkAuth(req.headers.authorization)){
            next();
        }else{
            res.send(`<h1>not Found Page</h1>`);
        }
    // }
});

// (/api/service/feedback/fix/get/all)
router.get('/fix/get/all', function(req,res){
    const sql = `
        SELECT feedback_fix.*, user.user_nickname FROM feedback_fix 
        JOIN user ON feedback_fix.user_id=user.user_id
        WHERE feedback_fix.fdbf_isDeleted=0
        ORDER BY feedback_fix.fdbf_created DESC
    `;
    connect.query(sql, function(err, rows){
        if(err){
            console.log(err)
            return res.json({message:'error'});
        }

        const result = [];
        for(let i = 0; i< rows.length;i++){
            let d = {
                fdId:rows[i].fdbf_id,
                fdDesc:rows[i].fdbf_desc,
                fdImageList:JSON.parse(rows[i].fdbf_image_list),
                fdCreated:rows[i].fdbf_created,
                fdUpdated:rows[i].fdbf_updated,
                fdState:rows[i].fdbf_state,
                fdUserNickname:rows[i].user_nickname
            }
            result.push(d)
        }
        res.json({message:'success', data:result});
    });
})

// (/api/service/feedback/fix/write)
router.post('/fix/write',function(req,res){
    // console.log(req.body.description);
    // console.log(req.body.feedImageList);
    if (req.body.usid === null) {
        return res.json({ message: 'invalidUser' });
    }

    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, (err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                const sql = `
                    INSERT INTO feedback_fix (user_id, fdbf_desc, fdbf_image_list)
                    VALUES(?,?,?)
                `;
                const params = [user_id,req.body.description,req.body.feedImageList]
                connect.query(sql, params, function(err,rows){
                    if(err){
                        return res.json({message:'error'});
                    }
                    if(rows){
                        return res.json({message:'success'});
                    }
                    
                })
            });
        }
    });
    
});


module.exports = router;