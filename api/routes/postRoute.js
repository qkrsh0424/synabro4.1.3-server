const express = require('express');
const router = express();
const connect = require('../../database/database');
const cipher = require('../../handler/security');

var redis = require('redis'),
    client = redis.createClient();

router.get('/getpost/all',function(req,res){
    let sql = `
        SELECT * FROM post WHERE post_isDeleted=0
    `;
    connect.query(sql, function(err, rows, fields){
        res.json(rows);
    });
});

module.exports = router;