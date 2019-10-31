const express = require('express');
const router = express();
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
    
router.post('/',function(req,res){
    // let keykey = 'fnolUuyMpLC03toHAVLpmvEUJLRBQI6Q'
    // let sessID = 'sess:'+keykey;

    // client.exists(sessID,(err,re)=>{
    //     console.log(re);
    // })
    // console.log('hi');
    if(req.body.usid!==undefined){
        const sessID = 'sess:'+cipher.decrypt(req.body.usid);
        client.exists(sessID,(err, replyExists)=>{
            if(replyExists){
                client.get(sessID,(err,replyGet)=>{
                    result = JSON.parse(replyGet);
                    res.status(200).json({
                        message:'connect success', 
                        sessid: req.body.usid,
                        user_id:result.user.user_id, 
                        user_nickname: result.user.user_nickname
                    });
                });
            }else{
                res.status(200).json({message:'connect fail'})
            }
        })
    }else{
        res.status(200).json({message:'connect fail'})
    }
    
    // if(req.session){
    //     if(req.session.user){
    //         res.status(200).json({
    //             message:'connect success', 
    //             sessid: req.sessionID,
    //             user_id:req.session.user.user_id, 
    //             user_nickname: req.session.user.user_nickname
    //         })
    //     }else{
    //         res.status(200).json({message:'connect fail'})
    //     }
    // }
});

module.exports = router;