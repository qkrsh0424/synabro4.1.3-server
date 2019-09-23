const express = require('express');
const router = express();

router.post('/',function(req,res){
    if(req.session){
        if(req.session.user){
            res.status(201).json({
                message:'connect success', 
                sessid: req.sessionID,
                user_id:req.session.user.user_id, 
                user_nickname: req.session.user.user_nickname
            })
        }else{
            res.status(201).json({message:'connect fail'})
        }
    }
});

module.exports = router;