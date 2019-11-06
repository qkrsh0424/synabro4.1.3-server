const express = require('express');
const router = express();
const cipher = require('../../handler/security');
const connect = require('../../database/database');

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

router.post('/checkAdmin', function(req,res){
    // console.log(req.body.usid);
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'error' });
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM member_of_group WHERE user_id=?
                `;
                let params = [user_id];

                connect.query(sql, params,function(err, rows, fields){
                    let result = [];
                    if(rows[0] && rows[0].member_type===1001){
                        return res.json({message:'success', data:rows[0].head_type});
                    }else{
                        return res.json({ message: 'error' });            
                    }
                    
                });
            });
        }else{
            return res.json({ message: 'error' });
        }
    });
});

router.post('/checkApply', function(req,res){
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'error' });
    }

    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;
                let sql = `
                    SELECT * FROM member_apply
                    WHERE user_id=? AND head_type=? AND memap_isDeleted=0
                `;
                let params = [user_id, req.body.head_type];
                connect.query(sql, params, function(err, rows, fields){
                    if(rows[0]){
                        res.json({message:'have'});
                    }else{
                        res.json({message:'none'});
                    }
                })
            });
        }
    });
})

router.post('/apply',function(req,res){
    // console.log(req.body.usid);
    // console.log(req.body.head_type);
    // console.log(req.body.resume);
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'error' });
    }

    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;
                
                let sql = `
                    SELECT * FROM member_apply WHERE user_id=? AND head_type=?
                `;
                let params = [user_id, req.body.head_type];
                connect.query(sql, params, function(err, checkApplied, fields){
                    if(checkApplied[0]){
                        if(checkApplied[0].memap_isDeleted===0){
                            return res.json({message:'processing'});
                        }else if(checkApplied[0].memap_isDeleted===1){
                            return res.json({message:'exist'});
                        }
                    }
                    let sql = `
                        INSERT INTO member_apply(user_id, head_type, memap_introduce_self) 
                        VALUES (?,?,?)
                    `;
                    let params = [user_id, req.body.head_type, req.body.resume];
                    connect.query(sql, params, function(err, rows, fields){
                        if(rows){
                            res.json({message:'success'});
                        }else{
                            res.json({message:'error'});
                        }
                    });
                })
                
            });
        }else{
            res.json({message:'disconUser'});
        }
    });
});


module.exports = router;