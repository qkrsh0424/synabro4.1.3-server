const express = require('express');
const router = express();
const connect = require('../../database/database');

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
    connect.query(sql, params, function(err, rows, fields){
        let result = [];
        for(let i = 0; i<rows.length; i++){
            let row;
            if(req.session.user){
                if(rows[i].user_id===req.session.user.user_id){
                    row={
                        cmt_id:rows[i].cmt_id,
                        cmt_desc:rows[i].cmt_desc,
                        cmt_created:rows[i].cmt_created,
                        user_nickname:rows[i].user_nickname,
                        mycomment:'ok'
                    }
                }
            }
            else{
                row={
                    cmt_id:rows[i].cmt_id,
                    cmt_desc:rows[i].cmt_desc,
                    cmt_created:rows[i].cmt_created,
                    user_nickname:rows[i].user_nickname,
                }
            }
            result.push(row);
        }
        // console.log(rows.length);
        res.send(result);
    })
});

router.post('/univ_post_comment', function(req,res){
    if(req.session.user!==undefined){
        let sql = `
            INSERT INTO univ_comment(cmt_desc, user_id, post_id, head_type)
            VALUES (?,?,?,?)
        `;

        let params = [req.body.cmt_desc, req.session.user.user_id, req.body.post_id, req.body.head_type];
        
        connect.query(sql, params, function(err, rows, fields){
            if(err){
                res.status(500).json({message:'error'});
            }else{
                if(rows.insertId){
                    let sql =`
                        UPDATE univ_post SET post_comment_count=post_comment_count+1 WHERE post_id=?
                    `;
                    let params = [req.body.post_id];
                    connect.query(sql, params, function(err, resultrows, fields){
                        res.json({message:'success'});
                    });
                }else{
                    res.json({message:'failure'});
                }
            }
        });
    }else{
        res.json({message:'non-user'})
    }
    
});

router.delete('/univ_post_comment', function(req,res){
    let sql = `
        UPDATE univ_comment 
        SET cmt_isDeleted=-1
        WHERE cmt_id=? AND head_type=?
    `;
    let params = [req.query.cmt_id, req.query.head_type];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            res.status(500).json({message:'error'});
        }else{
            if(rows.changeRows!==0){
                let sql =`
                        UPDATE univ_post SET post_comment_count=post_comment_count-1 WHERE post_id=? AND univ_id=?
                    `;
                    let params = [req.query.post_id, req.query.head_type];
                    connect.query(sql, params, function(err, resultrows, fields){
                        res.json({message:'success'});
                    });
            }else{
                res.json({message:'failure'})
            }
        }
    })
})

module.exports = router;