const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');
const requestip = require('request-ip');

var redis = require('redis'),
    client = redis.createClient();

//Custom handler
const draftjsHandle = require('../../handler/draftjsHandle');

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

router.get('/post/:post_id', function (req, res) {
    var sql = `
        SELECT univ_post.*, user.user_nickname 
        FROM univ_post JOIN user ON univ_post.user_id=user.user_id 
        WHERE post_id=? AND post_isDeleted=0
    `;
    var params = [req.params.post_id];

    connect.query(sql, params, function (err, rows, fields) {
        if(rows[0]){
            if(req.query.usid===undefined){
                let result = [];
                result.push({
                    message: 'success',
                    post_id: rows[0].post_id,
                    univ_id: rows[0].univ_id,
                    post_type: rows[0].post_type,
                    post_topic: rows[0].post_topic,
                    post_desc: rows[0].post_desc,
                    post_comment_count: rows[0].post_comment_count,
                    post_view_count: rows[0].post_view_count,
                    post_like_count: rows[0].post_like_count,
                    post_created: rows[0].post_created,
                    user_nickname: rows[0].user_nickname,
                    like: 'off',
                });
                return res.json(result);
            }
    
            const sessID = 'sess:'+cipher.decrypt(req.query.usid);
            client.exists(sessID,(err,replyExists)=>{
                if(replyExists){
                    client.get(sessID,(err,replyGet)=>{
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        
                        let sql = `
                            SELECT * FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                        `;
                        let params = [user_id, req.params.post_id, rows[0].univ_id];
                        connect.query(sql, params, function (err, resultrows, fields) {
                            if (err) {
                                res.status(500).json({ message: 'error' });
                            } else {
                                let result = [];
                                if (resultrows[0]) {
    
                                    result.push({
                                        message: 'success',
                                        post_id: rows[0].post_id,
                                        univ_id: rows[0].univ_id,
                                        post_type: rows[0].post_type,
                                        post_topic: rows[0].post_topic,
                                        post_desc: rows[0].post_desc,
                                        post_comment_count: rows[0].post_comment_count,
                                        post_view_count: rows[0].post_view_count,
                                        post_like_count: rows[0].post_like_count,
                                        post_created: rows[0].post_created,
                                        user_nickname: rows[0].user_nickname,
                                        like: 'on',
                                    });
                                } else {
                                    result.push({
                                        message: 'success',
                                        post_id: rows[0].post_id,
                                        univ_id: rows[0].univ_id,
                                        post_type: rows[0].post_type,
                                        post_topic: rows[0].post_topic,
                                        post_desc: rows[0].post_desc,
                                        post_comment_count: rows[0].post_comment_count,
                                        post_view_count: rows[0].post_view_count,
                                        post_like_count: rows[0].post_like_count,
                                        post_created: rows[0].post_created,
                                        user_nickname: rows[0].user_nickname,
                                        like: 'off',
                                    });
                                }
                                res.json(result);
                                
                            }
                        });
                    });
                }
            });
        }else{
            res.status(500).json({ message: 'error' });
        }
        

        // if (req.session.user) {
        //     let sql = `
        //         SELECT * FROM post_like WHERE user_id=? AND post_id=?
        //     `;
        //     let params = [req.session.user.user_id, req.params.post_id];
        //     connect.query(sql, params, function (err, resultrows, fields) {
        //         if (err) {
        //             res.status(500).json({ message: 'error' });
        //         } else {
        //             let result = [];
        //             if (resultrows[0]) {
        //                 result.push({
        //                     message: 'success',
        //                     post_id: rows[0].post_id,
        //                     univ_id: rows[0].univ_id,
        //                     post_type: rows[0].post_type,
        //                     post_topic: rows[0].post_topic,
        //                     post_desc: rows[0].post_desc,
        //                     post_comment_count: rows[0].post_comment_count,
        //                     post_view_count: rows[0].post_view_count,
        //                     post_like_count: rows[0].post_like_count,
        //                     post_created: rows[0].post_created,
        //                     user_nickname: rows[0].user_nickname,
        //                     like: 'on',
        //                 });
        //             } else {
        //                 result.push({
        //                     message: 'success',
        //                     post_id: rows[0].post_id,
        //                     univ_id: rows[0].univ_id,
        //                     post_type: rows[0].post_type,
        //                     post_topic: rows[0].post_topic,
        //                     post_desc: rows[0].post_desc,
        //                     post_comment_count: rows[0].post_comment_count,
        //                     post_view_count: rows[0].post_view_count,
        //                     post_like_count: rows[0].post_like_count,
        //                     post_created: rows[0].post_created,
        //                     user_nickname: rows[0].user_nickname,
        //                     like: 'off',
        //                 });
        //             }
        //             res.json(result);
        //         }
        //     });
        // } else {
        //     let result = [];
        //     result.push({
        //         message: 'success',
        //         post_id: rows[0].post_id,
        //         univ_id: rows[0].univ_id,
        //         post_type: rows[0].post_type,
        //         post_topic: rows[0].post_topic,
        //         post_desc: rows[0].post_desc,
        //         post_comment_count: rows[0].post_comment_count,
        //         post_view_count: rows[0].post_view_count,
        //         post_like_count: rows[0].post_like_count,
        //         post_created: rows[0].post_created,
        //         user_nickname: rows[0].user_nickname,
        //         like: 'off',
        //     });
        //     res.json(result);
        // }
    });
});

// mainSearch and univSearch 
router.get("/search/all", function (req, res) {
    // console.log(req.query.writeData);

    if (req.query.writeData !== undefined) {
        var data = '%' + decodeURIComponent(req.query.writeData.toString()) + '%';
        /**
         *  리스폰스 데이터
         *  univ_post Table : post_id, univ_id, post_type, post_topic, post_desc, post_thumbnail_url, post_image_count, post_view_count, post_comment_count, post_like_count, post_created
         *  user Table : user_nickname
         */
        var sql =
                `SELECT 
                univ_post.post_id, univ_post.univ_id, univ_post.post_type, univ_post.post_topic, univ_post.post_desc, post_thumbnail_url,
                univ_post.post_image_count, univ_post.post_view_count, univ_post.post_comment_count, univ_post.post_like_count, univ_post.post_created,
                user.user_nickname
            FROM univ_post 
            JOIN user ON univ_post.user_id=user.user_id
            WHERE univ_post.post_isDeleted=0 AND (univ_post.post_topic LIKE ?)
            ORDER BY univ_post.post_created DESC`;
        var params = [data];
        connect.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }

            res.status(200).json(rows);
        });
    } else {

        var sql =
            "SELECT * FROM univ_post WHERE post_isDeleted=0 ORDER BY post_created DESC";
        var params = [];

        connect.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }

            res.status(200).json(rows);
        });
    }
});

router.get("/search/univ/:univ_id", function (req, res) {
    console.log(req.query.writeData);

    if (req.query.writeData) {
        var data = '%' + decodeURIComponent(req.query.writeData.toString()) + '%';
        var univ_id = req.params.univ_id;
        var sql =
            "SELECT * FROM univ_post WHERE univ_id=? AND post_isDeleted=0 AND post_topic LIKE ? ORDER BY post_created DESC";
        var params = [univ_id, data];
        console.log(data)
        connect.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }

            res.status(200).json(rows);
        });
    } else {
        var univ_id = req.params.univ_id;
        var sql =
            "SELECT * FROM univ_post WHERE univ_id=? AND post_isDeleted=0 ORDER BY post_created DESC";
        var params = [univ_id];

        connect.query(sql, params, function (err, rows, fields) {
            if (err) {
                console.log(err);
            }

            res.status(200).json(rows);
        });
    }
});

router.get('/getpost/univ/all',function(req,res){
    let sql = `
        SELECT univ_post.*, user.user_nickname
        FROM univ_post
        JOIN user ON univ_post.user_id=user.user_id
        WHERE univ_post.univ_id=? AND post_isDeleted=0
        ORDER BY univ_post.post_created DESC
    `;

    let params = [req.query.univ_id];

    connect.query(sql, params, function(err, rows, fields){
        let result = [];
            for(let i = req.query.startPostIndex; i<req.query.currentPostIndex;i++){
                if(rows[i]){
                    result.push({
                        post_id:rows[i].post_id,
                        univ_id:rows[i].univ_id,
                        post_type:rows[i].post_type,
                        post_topic:rows[i].post_topic,
                        post_desc:rows[i].post_desc,
                        post_thumbnail_url:rows[i].post_thumbnail_url,
                        post_like_count:rows[i].post_like_count,
                        post_comment_count:rows[i].post_comment_count,
                        post_view_count:rows[i].post_view_count,
                        post_image_count:rows[i].post_image_count,
                        user_nickname:rows[i].user_nickname,
                        post_created: rows[i].post_created,
                        post_updated:rows[i].post_updated,
                        liked:'off'
                    });
                }
            }
            res.json(result);
        });

});

router.get('/:univ_id/btpost', function (req, res) {
    var sql = `
        SELECT univ_post.*, user.user_nickname
        FROM univ_post 
        JOIN user ON univ_post.user_id=user.user_id 
        WHERE univ_id=? AND post_type=? AND post_isDeleted=0
        ORDER BY post_created DESC
    `;
    var params = [req.params.univ_id, req.query.board_type];
    // console.log(req.query.startPostIndex, req.query.currentPostIndex);

    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        let likePost = [];
        if(req.query.usid===undefined){
            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                if (rows[i]) {
                    rows[i] = { ...rows[i], liked: 'off' };
                    result.push(rows[i]);
                } else {
                    result.push(rows[i]);
                }
            }
            return res.send(result);
        }
        const sessID = 'sess:'+cipher.decrypt(req.query.usid);
        client.exists(sessID,(err,replyExists)=>{
            if(replyExists){
                client.get(sessID,(err,replyGet)=>{
                    const resultGet = JSON.parse(replyGet);
                    const user_id = resultGet.user.user_id;
                        let sql = `
                            SELECT * FROM post_like WHERE user_id=?
                        `;
                        let params = [user_id];
                        connect.query(sql, params, function (err, rows2, fields) {
                            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                                if (rows[i]) {
                                    let liked = 'off';
                                    for (let j = 0; j < rows2.length; j++) {
                                        if (rows[i].post_id === rows2[j].post_id && String(rows[i].univ_id)===String(rows2[j].post_like_head_type)) {
                                            liked = 'on';
                                        }
                                    }
                                    rows[i] = { ...rows[i], liked: liked }
                                    result.push(rows[i]);
                                } else {
                                    result.push(rows[i]);
                                }
                            }
                            res.send(result);
                        });
                });
            }else {
                for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                    if (rows[i]) {
                        rows[i] = { ...rows[i], liked: 'off' };
                        result.push(rows[i]);
                    } else {
                        result.push(rows[i]);
                    }
                }
                res.send(result);
            }
        });

        

        // if (req.session.user) {
        //     let sql = `
        //         SELECT * FROM post_like WHERE user_id=?
        //     `;
        //     let params = [req.session.user.user_id];
        //     connect.query(sql, params, function (err, rows2, fields) {
        //         for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
        //             if (rows[i]) {
        //                 let liked = 'off';
        //                 for (let j = 0; j < rows2.length; j++) {
        //                     if (rows[i].post_id === rows2[j].post_id) {
        //                         liked = 'on';
        //                     }
        //                 }
        //                 rows[i] = { ...rows[i], liked: liked }
        //                 result.push(rows[i]);
        //             } else {
        //                 result.push(rows[i]);
        //             }
        //         }
        //         res.send(result);
        //     });
        // } else {
        //     for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
        //         if (rows[i]) {
        //             rows[i] = { ...rows[i], liked: 'off' };
        //             result.push(rows[i]);
        //         } else {
        //             result.push(rows[i]);
        //         }
        //     }
        //     res.send(result);
        // }
    });
});


/**
 * 공지사항 포스터 3개만 가져와서 data에 푸쉬 한다.
 * 만약에 포스터 수가 3개 이하 일때는 undefined로 배열에 정리가 되며,
 * 클라이언트에서는 null로서 컨트롤 할수 있다.
 *  */

router.get('/:univ_id', function (req, res) {
    var startIndex = req.query.startIndex;
    var lastIndex = req.query.lastIndex;

    var sql = `
                SELECT univ_post.*, user.user_nickname 
                FROM univ_post JOIN user ON univ_post.user_id=user.user_id 
                WHERE univ_id=? AND post_type=?
                ORDER BY post_created DESC
            `;
    var params = [req.params.univ_id, req.query.boardType];
    var data = [];

    connect.query(sql, params, function (err, rows, fields) {
        for (let i = startIndex; i < lastIndex; i++) {
            data.push(rows[i]);
        }
        res.send(data);
    });
});


router.post('/writePost', function (req, res) {
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'invalidUser' });
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                //draftJS 포맷 형식으로만 파라미터를 설정해준다.
                let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
                let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.

                var sql = `INSERT INTO univ_post(univ_id, post_type, post_topic, post_desc, post_thumbnail_url, post_image_count, user_id)
                        VALUES(?,?,?,?,?,?,?)
                `;
                var params = [
                    req.body.univ_id,
                    req.body.post_type,
                    req.body.post_topic,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    user_id
                ];
                // const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
                // const ip = requestip.getClientIp(req);

                // console.log(ip);

                connect.query(sql, params, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (rows.insertId) {
                            res.status(201).json({ message: 'success' });
                        } else {
                            res.status(201).json({ message: 'failure' });
                        }
                    }
                });
            });
        }
    });
    // if (!req.session.user) {
    //     res.json({ message: 'invalidUser' });
    // } else {
    //     //draftJS 포맷 형식으로만 파라미터를 설정해준다.
    //     let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
    //     let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.

    //     var sql = `INSERT INTO univ_post(univ_id, post_type, post_topic, post_desc, post_thumbnail_url, post_image_count, user_id)
    //             VALUES(?,?,?,?,?,?,?)
    // `;
    //     var params = [
    //         req.body.univ_id,
    //         req.body.post_type,
    //         req.body.post_topic,
    //         req.body.post_desc,
    //         post_thumbnail_url,
    //         post_image_count,
    //         req.session.user.user_id
    //     ];
    //     // const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
    //     // const ip = requestip.getClientIp(req);

    //     // console.log(ip);

    //     connect.query(sql, params, function (err, rows, fields) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             if (rows.insertId) {
    //                 res.status(201).json({ message: 'success' });
    //             } else {
    //                 res.status(201).json({ message: 'failure' });
    //             }
    //         }
    //     });
    // }
});

router.post('/updatePost', function (req, res) {
            // console.log(req.body.usid);
            // console.log(req.body.univ_id);
            // console.log(req.body.post_type);
            // console.log(req.body.post_id);
            // console.log(req.body.post_topic);
            // console.log(req.body.post_desc);
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'invalidUser' });
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                //draftJS 포맷 형식으로만 파라미터를 설정해준다.
                let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
                let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.

                var sql = `
                    UPDATE univ_post 
                    SET post_topic=?,post_desc=?,post_thumbnail_url=?,post_image_count=?
                    WHERE univ_id=? AND post_type=? AND post_id=? AND user_id=?
                `;
                var params = [
                    req.body.post_topic,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    req.body.univ_id,
                    req.body.post_type,
                    req.body.post_id,
                    user_id
                ];
                // const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
                // const ip = requestip.getClientIp(req);

                // console.log(ip);

                connect.query(sql, params, function (err, rows, fields) {
                    if (err) {
                        res.status(201).json({ message: 'failure' });
                    } else {
                        // if (rows.insertId) {
                        //     res.status(201).json({ message: 'success' });
                        // } else {
                        //     res.status(201).json({ message: 'failure' });
                        // }
                        if(rows.message)
                            res.status(201).json({ message: 'success' });
                    }
                });
            });
        }
    });
});

router.patch('/postCountPlus', function (req, res) {
    let sql = `
        UPDATE univ_post SET post_view_count=post_view_count+1 WHERE post_id=?
    `;
    let params = [req.body.post_id];
    // console.log(req.body.post_id);
    connect.query(sql, params, function (err, rows, fields) {
        res.json({ message: 'postCountUpdateOK' });
    })
});

router.post('/posterValidation/univ', function(req,res){
    let sql = `
        SELECT user_id FROM univ_post 
        WHERE post_id=? AND univ_id=?
    `;
    let params = [req.body.post_id, req.body.head_type];

    connect.query(sql, params, function(err, postGet, fileds){
        if(postGet[0] && req.body.usid){
            const sessID = 'sess:'+cipher.decrypt(req.body.usid);

            client.exists(sessID,(err,replyExists)=>{
                if(replyExists){
                    client.get(sessID,(err,replyGet)=>{
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        if(user_id===postGet[0].user_id){
                            res.send("valid");
                        }else{
                            res.send("invalid");
                        }
                    });
                }
            });
            
        }else{
            res.send("error");
        }
        
    });
    
});

router.post('/deletePoster/univ/one', function(req,res){
    let sql = `
        SELECT user_id,post_id FROM univ_post 
        WHERE post_id=? AND univ_id=?
    `;
    let params = [req.body.post_id, req.body.head_type];

    connect.query(sql, params, function(err, postGet, fileds){
        if(postGet[0] && req.body.usid){
            const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    
            client.exists(sessID,(err,replyExists)=>{
                if(replyExists){
                    client.get(sessID,(err,replyGet)=>{
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        if(user_id===postGet[0].user_id){
                            let sql = `
                                UPDATE univ_post SET post_isDeleted=1
                                WHERE post_id=?
                            `;
                            let params = [postGet[0].post_id];

                            connect.query(sql, params, function(err, rows, fields){
                                res.send('success');
                            });
                        }else{
                            res.send('error');
                        }
                    });
                }else{
                    res.send('error');
                }
            });
        }
    });
    
});
module.exports = router;