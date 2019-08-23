const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get('/:univ_id/btpost', function (req, res) {
    var sql = `
        SELECT univ_post.*, user.user_nickname 
        FROM univ_post JOIN user ON univ_post.user_id=user.user_id 
        WHERE univ_id=? AND post_type=?
        ORDER BY post_created DESC
    `;

    console.log(req.query.startPostIndex,req.query.currentPostIndex);

    var params = [req.params.univ_id, req.query.board_type];
    connect.query(sql, params, function(err, rows, fields){
        let result = [];
        for(let i = req.query.startPostIndex ; i<req.query.currentPostIndex; i++){
            result.push(rows[i]);
        }
        res.send(result);
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

router.get('/:univ_id', function (req, res) {
    var sql = 'SELECT * FROM univ_post WHERE univ_id=?';
    var params = [req.params.univ_id];
    connect.query(sql, params, function (err, rows, fields) {
        console.log(rows);
    });
});

router.post('/writePost',function(req,res){
    var sql = `INSERT INTO univ_post(univ_id, post_type, post_topic, post_desc, user_id)
                VALUES(?,?,?,?,?)
    `;
    var params = [req.body.univ_id, req.body.post_type, req.body.post_topic, req.body.post_desc, req.session.user.user_id];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            console.log(err);
        }
        if(rows.insertId){
            res.status(201).json({message:'success'});
        }else{
            res.status(201).json({message:'failure'});
        }
    });
    
});

module.exports = router;