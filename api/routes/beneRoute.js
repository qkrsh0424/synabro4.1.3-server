const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get(['/:univ_id/:board_type','/:univ_id'],function(req,res){
    if(req.params.board_type){
        var sql = 'SELECT * FROM bene WHERE univ_id=? AND board_type=? AND bene_type=?';
        var params = [req.params.univ_id, req.params.board_type, req.query.bene_type];
        connect.query(sql, params, function(err, rows, fields){
            res.status(200).json(rows);
        })
    }else{
        var sql = 'SELECT * FROM bene WHERE board_type IS NULL AND univ_id=? AND bene_type=?';
        var params = [req.params.univ_id, req.query.bene_type];
        connect.query(sql, params, function(err, rows, fields){
            res.status(200).json(rows);
        })
    }
});

module.exports = router;