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

router.patch('/chguserinfo', function(req,res){
    // console.log(req.body.UID);
    // console.log(req.body.Email);
    // console.log(req.body.Name);
    // console.log(req.body.Nickname);
    // console.log(req.body.Job);
    // console.log(req.body.Major);
    // console.log(req.body.PW);

    // console.log('get uid : ', cipher.encrypt(req.body.UID));
    // console.log('uid : ', req.session.user.user_uid);
    if(req.body.usid===undefined){
        return res.json({message:'error'});
    }
    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    let user_uid = cipher.encrypt(req.body.UID);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let sess_user_uid = resultGet.user.user_uid;
                if(sess_user_uid===user_uid){
                    let sql = `SELECT * FROM user WHERE user_id=?`;
                    let params = [resultGet.user.user_id];
                    connect.query(sql, params, function(err, userInfo, fields){
                        if(err){
                            // console.log(err);
                            res.json({message:'error'});
                        }else{
                            let salt = userInfo[0].user_salt;
                            if(cipher.makeEncryptPassword(req.body.PW,salt)===userInfo[0].user_password){
                                let user_email = cipher.encrypt(req.body.Email);
                                let user_name = cipher.encrypt(req.body.Name);
                                let user_nickname = req.body.Nickname;
                                let user_job = req.body.Job;
                                let user_major = req.body.Major;
                                let sql = `
                                    UPDATE user 
                                    SET user_email=?, user_name=?, user_nickname=?, user_job=?, user_major=?
                                    WHERE user_uid=?
                                `;
                                let params = [user_email,user_name,user_nickname,user_job,user_major,user_uid];
            
                                connect.query(sql, params, function(err,rows,fields){
                                        if(err){
                                            // console.log(err);
                                            res.json({message:'error'});
                                        }else{
                                            if(rows.warningCount===0){
                                                resultGet.user.user_nickname=user_nickname;
                                                res.status(200).json({message:'success'});
                                            }else{
                                                res.json({message:'error'});
                                            }
                                        }
                                });
            
            
                            }else{
                                res.json({message:'CHECKPW'});
                            }
                        }
                    });
                }else{
                    res.json({message:'error'});
                }
            });
        }
    });
    // if(req.session.user.user_uid===user_uid){
    //     let sql = `SELECT * FROM user WHERE user_id=?`;
    //     let params = [req.session.user.user_id];
    //     connect.query(sql, params, function(err, userInfo, fields){
    //         if(err){
    //             // console.log(err);
    //             res.json({message:'error'});
    //         }else{
    //             let salt = userInfo[0].user_salt;
    //             if(cipher.makeEncryptPassword(req.body.PW,salt)===userInfo[0].user_password){
    //                 let user_email = cipher.encrypt(req.body.Email);
    //                 let user_name = cipher.encrypt(req.body.Name);
    //                 let user_nickname = req.body.Nickname;
    //                 let user_job = req.body.Job;
    //                 let user_major = req.body.Major;
    //                 // console.log(user_email,user_name,user_nickname,user_job,user_major);
    //                 let sql = `
    //                     UPDATE user 
    //                     SET user_email=?, user_name=?, user_nickname=?, user_job=?, user_major=?
    //                     WHERE user_uid=?
    //                 `;
    //                 let params = [user_email,user_name,user_nickname,user_job,user_major,user_uid];

    //                 connect.query(sql, params, function(err,rows,fields){
    //                         if(err){
    //                             // console.log(err);
    //                             res.json({message:'error'});
    //                         }else{
    //                             if(rows.warningCount===0){
    //                                 req.session.user.user_nickname=user_nickname;
    //                                 res.status(200).json({message:'success'});
    //                             }else{
    //                                 res.json({message:'error'});
    //                             }
    //                         }
    //                 });


    //             }else{
    //                 res.json({message:'CHECKPW'});
    //             }
    //         }
    //     });
    // }else{
    //     res.json({message:'error'});
    // }
});

router.post('/chgpassword',function(req,res){
    const getOldPassword = req.body.oldPassword;
    const getNewPassword = req.body.newPassword;
    if(req.body.usid===null){
        return res.status(200).json({message:'failure'});
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err, replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                const getUser_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM user WHERE user_id=?
                `;
                let params = [getUser_id];

                connect.query(sql, params, function(err, userInfo, fields){
                    if(err){
                        res.status(500).json({message:'error'});
                    }else{
                        let salt = userInfo[0].user_salt;
                        let getOldPasswordEncrypt = cipher.makeEncryptPassword(getOldPassword, salt);
                        if(userInfo[0].user_password===getOldPasswordEncrypt){
                            let newSalt = cipher.makeSalt();
                            let setNewPassword = cipher.makeEncryptPassword(getNewPassword, newSalt);

                            let sql = `
                                UPDATE user 
                                SET user_password=?, user_salt=?
                                WHERE user_id=?
                            `;
                            let params = [setNewPassword, newSalt, getUser_id];
                            
                            connect.query(sql, params, function(err, rows, fields){
                                if(err){
                                    res.json({message:'error'});
                                }else{
                                    if(rows.warningCount===0){
                                        res.status(200).json({message:'success'});
                                    }else{
                                        res.json({message:'error'});
                                    }
                                }
                            });
                        }else{
                            res.status(200).json({message:'failure'});
                        }
                    }
                })
            });
        }
    });

    // let sql = `
    //     SELECT * FROM user WHERE user_id=?
    // `;
    // let params = [getUser_id];

    // connect.query(sql, params, function(err, userInfo, fields){
    //     if(err){
    //         res.status(500).json({message:'error'});
    //     }else{
    //         let salt = userInfo[0].user_salt;
    //         let getOldPasswordEncrypt = cipher.makeEncryptPassword(getOldPassword, salt);
    //         if(userInfo[0].user_password===getOldPasswordEncrypt){
    //             let newSalt = cipher.makeSalt();
    //             let setNewPassword = cipher.makeEncryptPassword(getNewPassword, newSalt);

    //             let sql = `
    //                 UPDATE user 
    //                 SET user_password=?, user_salt=?
    //                 WHERE user_id=?
    //             `;
    //             let params = [setNewPassword, newSalt, getUser_id];
                
    //             connect.query(sql, params, function(err, rows, fields){
    //                 if(err){
    //                     res.json({message:'error'});
    //                 }else{
    //                     if(rows.warningCount===0){
    //                         res.status(200).json({message:'success'});
    //                     }else{
    //                         res.json({message:'error'});
    //                     }
    //                 }
    //             });
    //         }else{
    //             res.status(200).json({message:'failure'});
    //         }
    //     }
    // })

});

router.post('/dropuser',function(req,res){
    const getCurrentPassword = req.body.currentPassword;
    if(req.body.usid===null){
        return res.json({message:'error'});
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;
                let sql = `
                    SELECT * FROM user WHERE user_id=?
                `;
                let params = [user_id];
                connect.query(sql, params, function(err, userInfo, fields){
                    if(err){
                        res.status(500).json({message:'error'});
                    }else{
                        const salt = userInfo[0].user_salt;
                        const getCurrentPasswordEncrypt = cipher.makeEncryptPassword(getCurrentPassword, salt);
                        
                        if(userInfo[0].user_password===getCurrentPasswordEncrypt){
                            let sql = `DELETE FROM user WHERE user_id=?`;
                            let params = [user_id];
                            connect.query(sql, params, function(err,rows,fields){
                                if(rows.warningCount===0){
                                    // req.session.destroy();
                                    client.del(sessID);
                                    res.status(201).json({message:'success'});
                                }else{
                                    res.json({message:'error'});
                                }
                            });
                        }else{
                            res.json({message:'failure'});
                        }
                    }
                });
            })
        }else{
            return res.json({message:'error'});
        }
    })
    // let sql = `
    //     SELECT * FROM user WHERE user_id=?
    // `;
    // let params = [req.session.user.user_id];
    // connect.query(sql, params, function(err, userInfo, fields){
    //     if(err){
    //         res.status(500).json({message:'error'});
    //     }else{
    //         const salt = userInfo[0].user_salt;
    //         const getCurrentPasswordEncrypt = cipher.makeEncryptPassword(getCurrentPassword, salt);
            
    //         if(userInfo[0].user_password===getCurrentPasswordEncrypt){
    //             let sql = `DELETE FROM user WHERE user_id=?`;
    //             let params = [req.session.user.user_id];
    //             connect.query(sql, params, function(err,rows,fields){
    //                 if(rows.warningCount===0){
    //                     req.session.destroy();
    //                     res.status(201).json({message:'success'});
    //                 }else{
    //                     res.json({message:'error'});
    //                 }
    //             });
    //         }else{
    //             res.json({message:'failure'});
    //         }
    //     }
    // });
});

router.get('/mypostlist/univ',function(req,res){
    if(req.query.usid===undefined){
        return res.json({message:'invalidUser'});
    }
    
    const sessID = 'sess:' + cipher.decrypt(req.query.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let user_id = resultGet.user.user_id;
                let sql = `
                    SELECT univ_post.*, user.user_nickname, univ.univ_title, univ_item.univ_item_title
                    FROM univ_post 
                    JOIN user ON univ_post.user_id=user.user_id
                    JOIN univ ON univ_post.univ_id=univ.univ_id
                    JOIN univ_item ON univ_post.post_type=univ_item.univ_item_address
                    WHERE univ_post.user_id=? AND univ.univ_id=univ_item.univ_id AND univ_post.post_isDeleted=0
                    ORDER BY univ_post.post_created DESC
                `;
                let params = [user_id];
                connect.query(sql, params, function(err, rows, fields){
                    if(err){
                        res.json({message:'error'});
                    }else{
                        if(rows[0]){
                            let result=[];
                            for(let i = 0; i<rows.length;i++){
                                let rowitem = {
                                    message:'success',
                                    post_id:rows[i].post_id,
                                    univ_id:rows[i].univ_id,
                                    post_type:rows[i].post_type,
                                    post_topic:rows[i].post_topic,
                                    post_thumbnail_url:rows[i].post_thumbnail_url,
                                    post_image_count:rows[i].post_image_count,
                                    post_comment_count:rows[i].post_comment_count,
                                    post_view_count:rows[i].post_view_count,
                                    post_like_count:rows[i].post_like_count,
                                    post_created:rows[i].post_created,
                                    user_nickname:rows[i].user_nickname,
                                    univ_title:rows[i].univ_title,
                                    univ_item_title:rows[i].univ_item_title
                                }
                                result.push(rowitem);
                            }
                            res.json(result);
                        }else{
                            let result=[];
                            let rowitem = {
                                message:'notPost',
                            }
                            result.push(rowitem);
                            res.json(result);
                        }
                        
                    }
                });
            });
        }
    });
    // let sql = `
    //     SELECT univ_post.*, user.user_nickname FROM univ_post 
    //     JOIN user ON univ_post.user_id=user.user_id
    //     WHERE univ_post.user_id=? AND univ_post.post_isDeleted=0
    // `;
    // let params = [req.session.user.user_id];

    // connect.query(sql, params, function(err, rows, fields){
    //     if(err){
    //         res.json({message:'error'});
    //     }else{
    //         let result=[];
    //         for(let i = 0; i<rows.length;i++){
    //             let rowitem = {
    //                 post_id:rows[i].post_id,
    //                 univ_id:rows[i].univ_id,
    //                 post_type:rows[i].post_type,
    //                 post_topic:rows[i].post_topic,
    //                 post_thumbnail_url:rows[i].post_thumbnail_url,
    //                 post_image_count:rows[i].post_image_count,
    //                 post_comment_count:rows[i].post_comment_count,
    //                 post_view_count:rows[i].post_view_count,
    //                 post_like_count:rows[i].post_like_count,
    //                 post_created:rows[i].post_created,
    //                 user_nickname:rows[i].user_nickname
    //             }
    //             result.push(rowitem);
    //         }
    //         res.json(result);
    //     }
    // })

});

router.get('/mypostlist/shb',function(req,res){
    if(req.query.usid===undefined){
        return res.json({message:'invalidUser'});
    }
    
    const sessID = 'sess:' + cipher.decrypt(req.query.usid);
    client.exists(sessID,(err, replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                let resultGet = JSON.parse(replyGet);
                let user_id = resultGet.user.user_id;
                let sql = `
                    SELECT post.*, user.user_nickname, shb.shb_name, shb_item.shb_item_name
                    FROM post 
                    JOIN user ON post.user_id=user.user_id
                    JOIN shb ON post.shb_num=shb.shb_num
                    JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
                    WHERE post.user_id=? AND shb.shb_num=shb_item.shb_num AND post.post_isDeleted=0
                    ORDER BY post.post_created DESC
                `;
                let params = [user_id];
                connect.query(sql, params, function(err, rows, fields){
                    if(err){
                        res.json({message:'error'});
                    }else{
                        if(rows[0]){
                            let result=[];
                            for(let i = 0; i<rows.length;i++){
                                let rowitem = {
                                    message:'success',
                                    post_id:rows[i].post_id,
                                    parent_route:rows[i].parent_route,
                                    shb_num:rows[i].shb_num,
                                    shb_item_id:rows[i].shb_item_id,
                                    post_title:rows[i].post_title,
                                    post_thumbnail_url:rows[i].post_thumbnail_url,
                                    post_image_count:rows[i].post_image_count,
                                    post_comment_count:rows[i].post_comment_count,
                                    post_view_count:rows[i].post_view_count,
                                    post_like_count:rows[i].post_like_count,
                                    post_created:rows[i].post_created,
                                    user_nickname:rows[i].user_nickname,
                                    shb_name:rows[i].shb_name,
                                    shb_item_name:rows[i].shb_item_name
                                }
                                result.push(rowitem);
                            }
                            res.json(result);
                        }else{
                            let result=[];
                            let rowitem = {
                                message:'notPost',
                            }
                            result.push(rowitem);
                            res.json(result);
                        }
                        
                    }
                });
            });
        }
    });
});

module.exports = router;