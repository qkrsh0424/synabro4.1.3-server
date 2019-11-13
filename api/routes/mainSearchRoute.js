const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');

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

router.get("/search/shb", function (req, res) {
    // console.log(req.query.writeData);

    if (req.query.writeData !== undefined && req.query.writeData!=='') {
        var data = '%' + decodeURIComponent(req.query.writeData.toString()) + '%';
        /**
         *  리스폰스 데이터
         *  univ_post Table : post_id, univ_id, post_type, post_topic, post_desc, post_thumbnail_url, post_image_count, post_view_count, post_comment_count, post_like_count, post_created
         *  user Table : user_nickname
         */
        // var sql =`
        //     SELECT 
        //         univ_post.post_id, univ_post.univ_id, univ_post.post_type, univ_post.post_topic, univ_post.post_desc, post_thumbnail_url,
        //         univ_post.post_image_count, univ_post.post_view_count, univ_post.post_comment_count, univ_post.post_like_count, univ_post.post_created,
        //         user.user_nickname
        //     FROM univ_post 
        //     JOIN user ON univ_post.user_id=user.user_id
        //     WHERE univ_post.post_isDeleted=0 AND (univ_post.post_topic LIKE ?)
        //     ORDER BY univ_post.post_created DESC`;
        let sql = `
            SELECT * FROM post
            JOIN user ON post.user_id=user.user_id
            WHERE (post.post_title LIKE ?) AND post.post_isDeleted=0
            ORDER BY post.post_created DESC
        `;
        var params = [data];
        connect.query(sql, params, function (err, rows, fields) {
            let result=[];
            if(rows[0]){
                for(let i = 0; i< rows.length; i++){
                    let data = {
                        post_id:rows[i].post_id,
                        shb_num:rows[i].shb_num,
                        shb_item_id:rows[i].shb_item_id,
                        post_title:rows[i].post_title,
                        post_desc:rows[i].post_desc,
                        post_thumbnail_url:rows[i].post_thumbnail_url,
                        post_image_count:rows[i].post_image_count,
                        post_view_count:rows[i].post_view_count,
                        post_comment_count:rows[i].post_comment_count,
                        post_like_count:rows[i].post_like_count,
                        post_created:rows[i].post_created,
                        user_nickname:rows[i].user_nickname,
                        post_isSecret:rows[i].post_isSecret,
                        post_user_isSecret:rows[i].post_user_isSecret,
                        parent_route: rows[i].parent_route
                    }
                    result.push(data);
                }
                return res.status(200).json({message:'success',data:result});
            }else{
                return res.status(200).json({message:'none'});
            }
            

            
        });
    } else {
        res.json({message:'none'});
    }
});

module.exports = router;