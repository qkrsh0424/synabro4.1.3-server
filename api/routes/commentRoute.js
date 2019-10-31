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

router.get('/univ_post_comment',function(req,res){
    let sql = `
        SELECT univ_comment.*,
            user.user_nickname 
        FROM univ_comment
        JOIN user ON univ_comment.user_id=user.user_id
        WHERE univ_comment.post_id=? AND cmt_isDeleted=0
        ORDER BY univ_comment.cmt_updateAt DESC
    `;
    let params = [req.query.post_id];

    //cookie session 받기 시작
    connect.query(sql, params, function(err, rows, fields){
        let result = [];
        if(req.query.usid===undefined){
            let row;
            for(let i = 0; i<rows.length; i++){
                row={
                    cmt_id:rows[i].cmt_id,
                    cmt_desc:rows[i].cmt_desc,
                    cmt_created:rows[i].cmt_created,
                    user_nickname:rows[i].user_nickname,
                }
                result.push(row);
            }    
            return res.send(result);
        }

        const sessID = 'sess:'+cipher.decrypt(req.query.usid);
        client.exists(sessID,(err,replyExists)=>{
            if(replyExists){
                client.get(sessID,(err,replyGet)=>{
                    const resultGet = JSON.parse(replyGet);
                    const user_id = resultGet.user.user_id;

                    for(let i = 0; i<rows.length; i++){
                        let row;
                        if(rows[i].user_id===user_id){
                            row={
                                cmt_id:rows[i].cmt_id,
                                cmt_desc:rows[i].cmt_desc,
                                cmt_created:rows[i].cmt_created,
                                user_nickname:rows[i].user_nickname,
                                mycomment:'ok'
                            }
                        }else{
                            row={
                                cmt_id:rows[i].cmt_id,
                                cmt_desc:rows[i].cmt_desc,
                                cmt_created:rows[i].cmt_created,
                                user_nickname:rows[i].user_nickname,
                            }
                        }
                        result.push(row);
                    }
                    res.send(result);
                });
            }
        });
    });
    //cookie session 받기 끝

    /**
     * 이전 버전 세션 컨트롤
     */
    // connect.query(sql, params, function(err, rows, fields){
    //     let result = [];
        
    //     for(let i = 0; i<rows.length; i++){
    //         let row;
    //         if(req.session.user){
    //             if(rows[i].user_id===req.session.user.user_id){
    //                 row={
    //                     cmt_id:rows[i].cmt_id,
    //                     cmt_desc:rows[i].cmt_desc,
    //                     cmt_created:rows[i].cmt_created,
    //                     user_nickname:rows[i].user_nickname,
    //                     mycomment:'ok'
    //                 }
    //             }
    //         }
    //         else{
    //             row={
    //                 cmt_id:rows[i].cmt_id,
    //                 cmt_desc:rows[i].cmt_desc,
    //                 cmt_created:rows[i].cmt_created,
    //                 user_nickname:rows[i].user_nickname,
    //             }
    //         }
    //         result.push(row);
    //     }
    //     // console.log(rows.length);
    //     res.send(result);
    // })
});

router.post('/univ_post_comment', function(req,res){

    // console.log(req.body.usid)
    // cookie session 컨트롤 시작
    if(req.body.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    INSERT INTO univ_comment(cmt_desc, user_id, post_id, head_type)
                    VALUES (?,?,?,?)
                `;

                let params = [req.body.cmt_desc, user_id, req.body.post_id, req.body.head_type];
                
                connect.query(sql, params, function(err, rows, fields){
                    if(err){
                        res.status(500).json({message:'error'});
                    }else{
                        if(rows.insertId){
                            let commentCountSql = `
                                SELECT count(*) AS count FROM univ_comment WHERE post_id=? AND head_type=? AND cmt_isDeleted=0
                            `;
                            let commentCountParams = [req.body.post_id,req.body.head_type];
                            connect.query(commentCountSql,commentCountParams,function(err,commentCount){
                                // console.log(commentCount);
                                let sql =`
                                    UPDATE univ_post SET post_comment_count=? WHERE post_id=?
                                `;
                                let params = [commentCount[0].count,req.body.post_id];
                                connect.query(sql, params, function(err, resultrows, fields){
                                    res.json({message:'success'});
                                });
                            });
                            
                        }else{
                            res.json({message:'failure'});
                        }
                    }
                });
            });
        }else{
            return res.json({message:'non-user'})
        }
    });

    // cookie session 컨트롤 끝

    /**
     * 이전 버전 세션 컨트롤
     */
    // if(req.session.user!==undefined){
    //     let sql = `
    //         INSERT INTO univ_comment(cmt_desc, user_id, post_id, head_type)
    //         VALUES (?,?,?,?)
    //     `;

    //     let params = [req.body.cmt_desc, req.session.user.user_id, req.body.post_id, req.body.head_type];
        
    //     connect.query(sql, params, function(err, rows, fields){
    //         if(err){
    //             res.status(500).json({message:'error'});
    //         }else{
    //             if(rows.insertId){
    //                 let sql =`
    //                     UPDATE univ_post SET post_comment_count=post_comment_count+1 WHERE post_id=?
    //                 `;
    //                 let params = [req.body.post_id];
    //                 connect.query(sql, params, function(err, resultrows, fields){
    //                     res.json({message:'success'});
    //                 });
    //             }else{
    //                 res.json({message:'failure'});
    //             }
    //         }
    //     });
    // }else{
    //     res.json({message:'non-user'})
    // }
    
});

router.delete('/univ_post_comment', function(req,res){
    let sql = `
        UPDATE univ_comment 
        SET cmt_isDeleted=1
        WHERE cmt_id=? AND head_type=?
    `;
    let params = [req.query.cmt_id, req.query.head_type];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            res.status(500).json({message:'error'});
        }else{
            if(rows.changeRows!==0){
                let commentCountSql = `
                    SELECT count(*) AS count FROM univ_comment WHERE post_id=? AND head_type=? AND cmt_isDeleted=0
                `;
                let commentCountParams = [req.query.post_id,req.query.head_type];
                connect.query(commentCountSql,commentCountParams,function(err,commentCount){
                    // console.log('delete',commentCount);
                    let sql =`
                        UPDATE univ_post SET post_comment_count=? WHERE post_id=?
                    `;
                    let params = [commentCount[0].count,req.query.post_id];
                    connect.query(sql, params, function(err, resultrows, fields){
                        res.json({message:'success'});
                    });
                });
            }else{
                res.json({message:'failure'})
            }
        }
    })
})


router.get('/post_comment/get/all',function(req,res){
    let sql = `
        SELECT comment.*,
            user.user_nickname 
        FROM comment
        JOIN user ON comment.user_id=user.user_id
        WHERE comment.post_id=? AND cmt_isDeleted=0
        ORDER BY comment.cmt_created DESC
    `;
    let params = [req.query.post_id];

    //cookie session 받기 시작
    connect.query(sql, params, function(err, rows, fields){
        let result = [];
        if(req.query.usid===undefined){
            let row;
            for(let i = 0; i<rows.length; i++){
                row={
                    cmt_id:rows[i].cmt_id,
                    cmt_desc:rows[i].cmt_desc,
                    cmt_created:rows[i].cmt_created,
                    user_nickname:rows[i].user_nickname,
                }
                result.push(row);
            }    
            return res.send(result);
        }

        const sessID = 'sess:'+cipher.decrypt(req.query.usid);
        client.exists(sessID,(err,replyExists)=>{
            if(replyExists){
                client.get(sessID,(err,replyGet)=>{
                    const resultGet = JSON.parse(replyGet);
                    const user_id = resultGet.user.user_id;

                    for(let i = 0; i<rows.length; i++){
                        let row;
                        if(rows[i].user_id===user_id){
                            row={
                                cmt_id:rows[i].cmt_id,
                                cmt_desc:rows[i].cmt_desc,
                                cmt_created:rows[i].cmt_created,
                                user_nickname:rows[i].user_nickname,
                                mycomment:'ok'
                            }
                        }else{
                            row={
                                cmt_id:rows[i].cmt_id,
                                cmt_desc:rows[i].cmt_desc,
                                cmt_created:rows[i].cmt_created,
                                user_nickname:rows[i].user_nickname,
                            }
                        }
                        result.push(row);
                    }
                    res.send(result);
                });
            }
        });
    });
});

router.post('/post_comment/write', function(req,res){
    // usid, cmt_desc, post_id, head_type
    // console.log(req.body.usid)
    // cookie session 컨트롤 시작
    if(req.body.usid===null){
        return res.json({message:'non-user'})
    }

    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    INSERT INTO comment(cmt_desc, user_id, post_id, head_type)
                    VALUES (?,?,?,?)
                `;

                let params = [req.body.cmt_desc, user_id, req.body.post_id, req.body.head_type];
                
                connect.query(sql, params, function(err, rows, fields){
                    if(err){
                        res.status(500).json({message:'error'});
                    }else{
                        if(rows.insertId){
                            let commentCountSql = `
                                SELECT count(*) AS count FROM comment WHERE post_id=? AND head_type=? AND cmt_isDeleted=0
                            `;
                            let commentCountParams = [req.body.post_id,req.body.head_type];
                            connect.query(commentCountSql,commentCountParams,function(err,commentCount){
                                // console.log(commentCount);
                                let sql =`
                                    UPDATE post SET post_comment_count=? WHERE post_id=?
                                `;
                                let params = [commentCount[0].count,req.body.post_id];
                                connect.query(sql, params, function(err, resultrows, fields){
                                    res.json({message:'success'});
                                });
                            });
                            
                        }else{
                            res.json({message:'failure'});
                        }
                    }
                });
            });
        }else{
            return res.json({message:'non-user'})
        }
    }); 
});

router.delete('/post_comment/delete', function(req,res){
    let sql = `
        UPDATE comment 
        SET cmt_isDeleted=1
        WHERE cmt_id=? AND head_type=?
    `;
    let params = [req.query.cmt_id, req.query.head_type];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            res.status(500).json({message:'error'});
        }else{
            if(rows.changeRows!==0){
                let commentCountSql = `
                    SELECT count(*) AS count FROM comment WHERE post_id=? AND head_type=? AND cmt_isDeleted=0
                `;
                let commentCountParams = [req.query.post_id,req.query.head_type];
                connect.query(commentCountSql,commentCountParams,function(err,commentCount){
                    // console.log('delete',commentCount);
                    let sql =`
                        UPDATE post SET post_comment_count=? WHERE post_id=?
                    `;
                    let params = [commentCount[0].count,req.query.post_id];
                    connect.query(sql, params, function(err, resultrows, fields){
                        console.log(resultrows);
                        res.json({message:'success'});
                    });
                });
            }else{
                res.json({message:'failure'})
            }
        }
    })
})
module.exports = router;