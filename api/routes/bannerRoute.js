const express = require('express');
const router = express();
const connect = require('../../database/database');

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

router.get('/getBanner/mainPage/header',function(req,res){
    let sql = `
        SELECT * FROM banner 
        WHERE head_type=? AND banner_type=? AND banner_isDeleted=0
        ORDER BY banner_order DESC
    `;
    let params = [req.query.head_type, req.query.banner_type];

    connect.query(sql, params, function(err, rows, fields){
        if(rows[0]){
            res.json({message:'success', data:rows});
        }else{
            res.json({message:'none', noData:['nonBanner']});
        }
    })
});

router.get('/getBanner/group/header',function(req,res){

});

module.exports = router;