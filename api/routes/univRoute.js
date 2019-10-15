const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get('/', function (req, res) {
    if (req.query.selectedIndex) {
        var sql = 'SELECT * FROM univ WHERE univ_id=?';
        var params = [req.query.selectedIndex];
        connect.query(sql, params, function (err, rows, fields) {
            res.send(rows[0]);
        })
    } else {
        var sql = 'SELECT * FROM univ';
        connect.query(sql, function (err, rows, fields) {
            res.send(rows);
        })
    }

});

module.exports = router;