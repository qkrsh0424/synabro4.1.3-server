const express = require('express');
const router = express();
const connect = require('../../database/database');
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

router.get('/', function (req, res) {
    if (req.query.selectedIndex) {
        var sql = 'SELECT * FROM univ WHERE univ_id=?';
        var params = [req.query.selectedIndex];
        connect.query(sql, params, function (err, rows, fields) {
            if(rows[0]){
                res.send({message:'success',data:rows[0]});
            }else{
                res.send({message:'error'});
            }
            
        })
    } else {
        var sql = 'SELECT * FROM univ';
        connect.query(sql, function (err, rows, fields) {
            res.send(rows);
        })
    }

});

module.exports = router;