const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');
var redis = require('redis'),
    client = redis.createClient();

router.get('/get_list', function(req,res){
    const sessID = 'sess:' + cipher.decrypt(req.query.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let user_id = resultGet.user.user_id;
                var sql = `
                    SELECT univ_post.post_id, univ_post.univ_id,univ_post.post_type, univ_post.post_topic,
                        user.user_nickname 
                    FROM post_like 
                    JOIN univ_post ON univ_post.post_id=post_like.post_id
                    JOIN user ON univ_post.user_id=user.user_id
                    WHERE post_like.user_id=?
                `;
                var params = [user_id];

                connect.query(sql, params, function(err, rows, fields){
                    
                    res.status(200).json(rows);        
                });
            })
        }
    });
});

router.post('/like', function(req,res){
    // console.log(req.body.usid, req.body.head_type, req.body.post_id)
    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let user_id = resultGet.user.user_id;
                
                var sql =`
                        SELECT * FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                    `;
                    let params = [user_id, req.body.post_id, req.body.head_type];
                    connect.query(sql,params, function(err, check, fields){
                        
                        if(check[0]===undefined){
                            // var sql;
                            // if(req.body.parentType==='univ'){
                            //     sql = `
                            //         UPDATE univ_post
                            //         SET post_like_count = post_like_count+1
                            //         WHERE post_id = ?
                            //     `;
                            // }else{
                            //     sql = `
                            //         UPDATE post
                            //         SET post_like_count = post_like_count+1
                            //         WHERE post_id = ?
                            //     `;
                            // }
                            
                            // var params = [req.body.post_id];
                            // connect.query(sql, params, function(err, rows, fields){
                                var sql = `
                                    INSERT INTO post_like(user_id, post_id, post_like_head_type) VALUES(?,?,?)
                                `;
                                var params = [user_id, req.body.post_id, req.body.head_type];
                                connect.query(sql, params, function(err, rows2, fields){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        let countSql=`
                                            SELECT count(*) AS count FROM post_like WHERE post_id=? AND post_like_head_type=?
                                        `;
                                        let countSqlParams = [req.body.post_id, req.body.head_type];

                                        connect.query(countSql, countSqlParams, function(err, likecount){
                                            var sql;
                                            if(req.body.parentType==='univ'){
                                                sql = `
                                                    UPDATE univ_post
                                                    SET post_like_count = ?
                                                    WHERE post_id = ?
                                                `;
                                            }else{
                                                sql = `
                                                    UPDATE post
                                                    SET post_like_count = ?
                                                    WHERE post_id = ?
                                                `;
                                            }
                                            
                                            var params = [likecount[0].count,req.body.post_id];
                                            connect.query(sql, params, function(err, rows, fields){
                                                res.json({message:'like ok', sql: rows});
                                            });
                                        });
                                        
                                    }
                                });
                            // });
                        }else{
                            res.json({message:'like fail'});
                        }
                    });
                
            });
        }
    });
    // var sql = `
    //     UPDATE univ_post
    //     SET post_like_count = post_like_count+1
    //     WHERE post_id = ?
    // `;
    // var params = [req.body.post_id];

    // connect.query(sql, params, function(err, rows, fields){
    //     var sql = `
    //         INSERT INTO post_like(user_id, post_id, post_like_head_type) VALUES(?,?,?)
    //     `;
    //     var params = [req.session.user.user_id, req.body.post_id, req.body.head_type];
    //     connect.query(sql, params, function(err, rows2, fields){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.json({message:'like ok', sql: rows});
    //         }
    //     });
    // });
    
});

router.post('/unlike', function(req,res){
    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let user_id = resultGet.user.user_id;
                // var sql;
                // if(req.body.parentType==='univ'){
                //     sql = `
                //         UPDATE univ_post
                //         SET post_like_count = post_like_count-1
                //         WHERE post_id = ?
                //     `;
                // }else{
                //     sql = `
                //         UPDATE post
                //         SET post_like_count = post_like_count-1
                //         WHERE post_id = ?
                //     `;
                // }
                
                // var params = [req.body.post_id];

                // connect.query(sql, params, function(err, rows, fields){
                        var sql = `
                            DELETE FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                        `;
                        var params = [user_id, req.body.post_id,req.body.head_type];
                        connect.query(sql, params, function(err, rows2, fields){
                            if(err){
                                console.log(err);
                            }else{
                                let countSql=`
                                    SELECT count(*) AS count FROM post_like WHERE post_id=? AND post_like_head_type=?
                                `;
                                let countSqlParams = [req.body.post_id, req.body.head_type];

                                connect.query(countSql, countSqlParams, function(err, likecount){
                                    var sql;
                                    if(req.body.parentType==='univ'){
                                        sql = `
                                            UPDATE univ_post
                                            SET post_like_count = ?
                                            WHERE post_id = ?
                                        `;
                                    }else{
                                        sql = `
                                            UPDATE post
                                            SET post_like_count = ?
                                            WHERE post_id = ?
                                        `;
                                    }
                                    
                                    var params = [likecount[0].count,req.body.post_id];
                                    connect.query(sql, params, function(err, rows, fields){
                                        res.json({message:'unlike ok', sql: rows});
                                    });
                                });
                            }
                        });
                // });
            });
        }
    });
    
    
});
module.exports = router;