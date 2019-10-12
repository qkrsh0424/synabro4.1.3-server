const express = require('express');
const router = express();
const cipher = require('../../handler/security');
var redis = require('redis'),
    client = redis.createClient();

router.post('/',function(req,res){
    // req.session.destroy();
    // res.status(201).json({message:'success'});
    let sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.del(sessID,(err,replyDel)=>{
                if(replyDel){
                    res.status(200).json({message:'success'});
                }else{
                    res.status(200).json({message:'failure'});
                }
            });
        }else{
            res.status(201).json({message:'failure'});
        }
    })
});

module.exports = router;