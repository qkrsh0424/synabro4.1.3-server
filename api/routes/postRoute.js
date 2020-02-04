const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');

var redis = require('redis'),
    client = redis.createClient();

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

router.get('/getpost/all', function (req, res) {
    // console.log(req.query.numIndex);
    let getLimit = Number(req.query.numIndex);
    // console.log(getLimit);
    let sql = `
        SELECT * FROM post 
        JOIN user ON post.user_id=user.user_id
        JOIN shb ON post.shb_num=shb.shb_num
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post_isDeleted=0 AND shb_item.shb_item_visible=1
        ORDER BY post_created DESC
        LIMIT ?
    `;
    
    let params = [getLimit];
    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        if(rows[0]){
            for(let i = 0; i< rows.length; i++){
                let data = {
                    post_id:rows[i].post_id,
                    shb_num: rows[i].shb_num,
                    shb_name: rows[i].shb_name,
                    shb_item_id: rows[i].shb_item_id,
                    shb_item_name: rows[i].shb_item_name,
                    parent_route: rows[i].parent_route,
                    post_title: rows[i].post_title,
                    post_desc: rows[i].post_title,
                    post_thumbnail_url: rows[i].post_thumbnail_url,
                    post_like_count: rows[i].post_like_count,
                    post_comment_count: rows[i].post_comment_count,
                    post_view_count: rows[i].post_view_count,
                    post_image_count: rows[i].post_image_count,
                    post_created: rows[i].post_created,
                    post_updated: rows[i].post_updated,
                    user_nickname: rows[i].user_nickname,
                    post_isSecret: rows[i].post_isSecret,
                    post_user_isSecret: rows[i].post_user_isSecret,
                }
                result.push(data);
            }
            res.json({message:'success',data:result});
        }else{
            res.json({message:'none'});
        }
        
    });
});

router.get('/getpost/one', function (req, res) {
    let sql = `
        SELECT post.*, user.user_nickname FROM post 
        JOIN user ON post.user_id=user.user_id
        JOIN shb_item ON post.shb_item_id=shb_item.shb_item_id
        WHERE post.post_id=? AND post.post_isDeleted=0 AND shb_item.shb_item_visible=1`;
    let params = [req.query.post_id];

    connect.query(sql, params, function (err, rowsPost) {
        if (rowsPost[0]) {
            if (req.query.usid === undefined) {
                let result = [];
                result.push({
                    message: 'success',
                    post_id: rowsPost[0].post_id,
                    shb_num: rowsPost[0].shb_num,
                    shb_item_id: rowsPost[0].shb_item_id,
                    parent_route: rowsPost[0].parent_route,
                    post_title: rowsPost[0].post_title,
                    post_desc: rowsPost[0].post_desc,
                    post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                    post_like_count: rowsPost[0].post_like_count,
                    post_comment_count: rowsPost[0].post_comment_count,
                    post_view_count: rowsPost[0].post_view_count,
                    post_image_count: rowsPost[0].post_image_count,
                    user_nickname: rowsPost[0].user_nickname,
                    post_isSecret: rowsPost[0].post_isSecret,
                    post_user_isSecret: rowsPost[0].post_user_isSecret,
                    post_materials: JSON.parse(rowsPost[0].post_materials),
                    post_created: rowsPost[0].post_created,
                    post_updated: rowsPost[0].post_updated,
                    liked: 'off'
                });
                return res.json(result);
            }
            
            const sessID = 'sess:' + cipher.decrypt(req.query.usid);
            client.exists(sessID, (err, replyExists) => {
                
                if (replyExists) {
                    client.get(sessID, (err, replyGet) => {
                        const resultGet = JSON.parse(replyGet);
                        const user_id = resultGet.user.user_id;
                        let sql = `
                                SELECT * FROM post_like WHERE user_id=? AND post_id=? AND post_like_head_type=?
                            `;
                        let params = [user_id, req.query.post_id, rowsPost[0].shb_num];
                        connect.query(sql, params, function (err, resultrows, fields) {
                            if (err) {
                                res.status(500).json({ message: 'error' });
                            } else {
                                let result = [];
                                if (resultrows[0]) {

                                    result.push({
                                        message: 'success',
                                        post_id: rowsPost[0].post_id,
                                        shb_num: rowsPost[0].shb_num,
                                        shb_item_id: rowsPost[0].shb_item_id,
                                        parent_route: rowsPost[0].parent_route,
                                        post_title: rowsPost[0].post_title,
                                        post_desc: rowsPost[0].post_desc,
                                        post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                                        post_like_count: rowsPost[0].post_like_count,
                                        post_comment_count: rowsPost[0].post_comment_count,
                                        post_view_count: rowsPost[0].post_view_count,
                                        post_image_count: rowsPost[0].post_image_count,
                                        user_nickname: rowsPost[0].user_nickname,
                                        post_isSecret: rowsPost[0].post_isSecret,
                                        post_user_isSecret: rowsPost[0].post_user_isSecret,
                                        post_materials:JSON.parse(rowsPost[0].post_materials),
                                        post_created: rowsPost[0].post_created,
                                        post_updated: rowsPost[0].post_updated,
                                        like: 'on',
                                    });
                                } else {
                                    result.push({
                                        message: 'success',
                                        post_id: rowsPost[0].post_id,
                                        shb_num: rowsPost[0].shb_num,
                                        shb_item_id: rowsPost[0].shb_item_id,
                                        parent_route: rowsPost[0].parent_route,
                                        post_title: rowsPost[0].post_title,
                                        post_desc: rowsPost[0].post_desc,
                                        post_thumbnail_url: rowsPost[0].post_thumbnail_url,
                                        post_like_count: rowsPost[0].post_like_count,
                                        post_comment_count: rowsPost[0].post_comment_count,
                                        post_view_count: rowsPost[0].post_view_count,
                                        post_image_count: rowsPost[0].post_image_count,
                                        user_nickname: rowsPost[0].user_nickname,
                                        post_isSecret: rowsPost[0].post_isSecret,
                                        post_user_isSecret: rowsPost[0].post_user_isSecret,
                                        post_materials:JSON.parse(rowsPost[0].post_materials),
                                        post_created: rowsPost[0].post_created,
                                        post_updated: rowsPost[0].post_updated,
                                        like: 'off',
                                    });
                                }
                                res.json(result);

                            }
                        });
                    });
                }
            });
            // res.json({message:'success',data:rowsPost})
        }else{
            res.json([{message:'error'}]);
        }
    });
})

router.get('/getpost/shbNum/all',function(req,res){
    if(!req.query.hasBoundary){
        let sql = `
            SELECT post.*, user.user_nickname, shb_item.shb_item_name
            FROM post
            JOIN user ON post.user_id=user.user_id
            JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
            WHERE post.shb_num=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
            ORDER BY post.post_created DESC
        `;
        let params = [req.query.shb_num];

        connect.query(sql, params, function(err, rows, fields){
            let result = [];
            for (let i = 0; i < rows.length; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        shb_item_name: rows[i].shb_item_name,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        });
    }else{
        let sql = `
            SELECT post.*, user.user_nickname, shb_item.shb_item_name
            FROM post
            JOIN user ON post.user_id=user.user_id
            JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
            WHERE post.shb_num=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
            ORDER BY post.post_created DESC
        `;
        let params = [req.query.shb_num];

        connect.query(sql, params, function(err, rows, fields){
            let result = [];
            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        shb_item_name: rows[i].shb_item_name,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        });
    }
    
})

router.get('/getpost/category/all', function (req, res) {
    // console.log(req.query.shb_num, req.query.shb_item_id);
    let sql = `
        SELECT post.*, user.user_nickname
        FROM post
        JOIN user ON post.user_id=user.user_id
        JOIN shb_item ON shb_item.shb_item_id=post.shb_item_id
        WHERE post.shb_num=? AND post.shb_item_id=? AND post_isDeleted=0 AND shb_item.shb_item_visible=1
        ORDER BY post.post_created DESC
    `;

    let params = [req.query.shb_num, req.query.shb_item_id];

    connect.query(sql, params, function (err, rows, fields) {
        let result = [];
        if (req.query.usid === undefined) {
            for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                if (rows[i]) {
                    result.push({
                        post_id: rows[i].post_id,
                        shb_num: rows[i].shb_num,
                        shb_item_id: rows[i].shb_item_id,
                        parent_route: rows[i].parent_route,
                        post_title: rows[i].post_title,
                        post_desc: rows[i].post_desc,
                        post_thumbnail_url: rows[i].post_thumbnail_url,
                        post_like_count: rows[i].post_like_count,
                        post_comment_count: rows[i].post_comment_count,
                        post_view_count: rows[i].post_view_count,
                        post_image_count: rows[i].post_image_count,
                        user_nickname: rows[i].user_nickname,
                        post_isSecret: rows[i].post_isSecret,
                        post_user_isSecret: rows[i].post_user_isSecret,
                        post_created: rows[i].post_created,
                        post_updated: rows[i].post_updated,
                        liked: 'off'
                    });
                }
            }
            return res.json(result);
        }

        const sessID = 'sess:' + cipher.decrypt(req.query.usid);
        client.exists(sessID, (err, replyExists) => {
            if (replyExists) {
                client.get(sessID, (err, replyGet) => {
                    const resultGet = JSON.parse(replyGet);
                    const user_id = resultGet.user.user_id;
                    let sql = `
                        SELECT * FROM post_like WHERE user_id=?
                    `;
                    let params = [user_id];

                    connect.query(sql, params, function (err, rows2, fields) {
                        for (let i = req.query.startPostIndex; i < req.query.currentPostIndex; i++) {
                            if (rows[i]) {
                                let liked = 'off'
                                for (let j = 0; j < rows2.length; j++) {
                                    if (rows[i].post_id === rows2[j].post_id && String(rows[i].shb_num) === String(rows2[j].post_like_head_type)) {
                                        liked = 'on'
                                    }
                                }
                                result.push({
                                    post_id: rows[i].post_id,
                                    shb_num: rows[i].shb_num,
                                    shb_item_id: rows[i].shb_item_id,
                                    parent_route: rows[i].parent_route,
                                    post_title: rows[i].post_title,
                                    post_desc: rows[i].post_desc,
                                    post_thumbnail_url: rows[i].post_thumbnail_url,
                                    post_like_count: rows[i].post_like_count,
                                    post_comment_count: rows[i].post_comment_count,
                                    post_view_count: rows[i].post_view_count,
                                    post_image_count: rows[i].post_image_count,
                                    user_nickname: rows[i].user_nickname,
                                    post_isSecret: rows[i].post_isSecret,
                                    post_user_isSecret: rows[i].post_user_isSecret,
                                    post_created: rows[i].post_created,
                                    post_updated: rows[i].post_updated,
                                    liked: liked
                                });

                            }
                        }
                        res.json(result);
                    })
                });
            }
        });

    });
});

router.post('/writepost/category', function (req, res) {
    if (req.body.usid === null) {
        return res.json({ message: 'invalidUser' });
    }

    const sessID = 'sess:' + cipher.decrypt(req.body.usid);
    client.exists(sessID, (err, replyExists) => {
        if (replyExists) {
            client.get(sessID, (err, replyGet) => {
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                //draftJS 포맷 형식으로만 파라미터를 설정해준다.
                let post_image_count = draftjsHandle.getImageCount(req.body.post_desc); // 이미지 개수 계산
                let post_thumbnail_url = draftjsHandle.getThumbnailUrl(req.body.post_desc); // 포스터의 첫번째 사진을 썸네일로 한다.
                let post_materials = null;
                if(req.body.post_materials[0]){
                    post_materials = JSON.stringify(req.body.post_materials);
                }
                // var sql = `INSERT INTO post(shb_num, shb_item_id, parent_route, post_title, post_desc, post_thumbnail_url, post_image_count, user_id)
                //         VALUES(?,?,?,?,?,?,?,?)
                // `;

                var sql = `INSERT INTO post(shb_num, shb_item_id, parent_route, post_title, post_desc, post_thumbnail_url, post_image_count, user_id, post_materials)
                        VALUES(?,?,?,?,?,?,?,?,?)
                `;
                var params = [
                    req.body.shb_num,
                    req.body.shb_item_id,
                    req.body.parent_route,
                    req.body.post_topic,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    user_id,
                    post_materials
                ];

                connect.query(sql, params, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.json({ message: 'error' });
                    } else {
                        if (rows.insertId) {
                            res.status(200).json({ message: 'success' });
                        } else {
                            res.status(200).json({ message: 'failure' });
                        }
                    }
                });
            });
        }
    });
});

router.post('/updatePost/category', function (req, res) {
    // console.log(req.body.usid);
    // console.log(req.body.shb_num);
    // console.log(req.body.shb_item_id);
    // console.log(req.body.post_id);
    // console.log(req.body.post_title);
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
                    UPDATE post 
                    SET post_title=?,post_desc=?,post_thumbnail_url=?,post_image_count=?, post_materials=?
                    WHERE shb_num=? AND shb_item_id=? AND post_id=? AND user_id=?
                `;
                var params = [
                    req.body.post_title,
                    req.body.post_desc,
                    post_thumbnail_url,
                    post_image_count,
                    JSON.stringify(req.body.post_materials),
                    req.body.shb_num,
                    req.body.shb_item_id,
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

// poster 유저 유효성 검사

router.post('/posterValidation/shb', function(req,res){
    let sql = `
        SELECT user_id FROM post 
        WHERE post_id=? AND shb_num=?
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

router.post('/deletePoster/shb/one', function(req,res){
    let sql = `
        SELECT user_id,post_id FROM post 
        WHERE post_id=? AND shb_num=?
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
                                UPDATE post SET post_isDeleted=1
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

router.post('/postCount/plus', function (req, res) {
    let sql = `
        UPDATE post SET post_view_count=post_view_count+1 WHERE post_id=?
    `;
    let params = [req.body.post_id];
    // console.log(req.body.post_id);
    connect.query(sql, params, function (err, rows, fields) {
        res.json({ message: 'postCountUpdateOK' });
    })
});

module.exports = router;