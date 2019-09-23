const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get('/get_list', function(req,res){
    var sql = `
        SELECT univ_post.post_id, univ_post.univ_id,univ_post.post_type, univ_post.post_topic,
            user.user_nickname 
        FROM post_like 
        JOIN univ_post ON univ_post.post_id=post_like.post_id
        JOIN user ON univ_post.user_id=user.user_id
        WHERE post_like.user_id=?
    `;
    var params = [req.session.user.user_id];

    connect.query(sql, params, function(err, rows, fields){
        
        res.status(200).json(rows);        
    });
});

router.post('/like', function(req,res){
    var sql = `
        UPDATE univ_post
        SET post_like_count = post_like_count+1
        WHERE post_id = ?
    `;
    var params = [req.body.post_id];

    connect.query(sql, params, function(err, rows, fields){
        var sql = `
            INSERT INTO post_like(user_id, post_id, post_like_head_type) VALUES(?,?,?)
        `;
        var params = [req.session.user.user_id, req.body.post_id, req.body.head_type];
        connect.query(sql, params, function(err, rows2, fields){
            if(err){
                console.log(err);
            }else{
                res.json({message:'like ok', sql: rows});
            }
        });
    });
    
});

router.post('/unlike', function(req,res){
    var sql = `
        UPDATE univ_post
        SET post_like_count = post_like_count-1
        WHERE post_id = ?
    `;
    var params = [req.body.post_id];

    connect.query(sql, params, function(err, rows, fields){
            var sql = `
                DELETE FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
            `;
            var params = [req.session.user.user_id, req.body.post_id,req.body.head_type];
            connect.query(sql, params, function(err, rows2, fields){
                if(err){
                    console.log(err);
                }else{
                    res.json({message:'unlike ok', sql: rows});
                }
            });
    });
    
});
module.exports = router;