const express = require('express');
const router = express();
const connect = require('../../database/database');

router.get('/get_contact', function(req,res){
  var sql = `SELECT * FROM contact`;
  connect.query(sql, function (err, rows, fields) {
    if(err){
      console.log(err);
      res.json({message:'failure'});
    }else{
      res.json({message:'success', data:rows});
    }
  });
})

router.get('/get_search_contact', function(req,res){

    // console.log(req.query.writeData);

    if (req.query.writeData) {
      var data = '%'+ decodeURIComponent(req.query.writeData.toString()) + '%';
      console.log(decodeURIComponent(req.query.writeData.toString()));
      
      var sql ="SELECT * FROM `contact` WHERE contact_name LIKE ? OR company LIKE ? OR Tel LIKE ? OR wechat_id LIKE ? OR category LIKE ? AND contact_isDeleted=0 ORDER BY contact_created DESC";
      var params = [
        data,
        data,
        data,
        data,
        data
        ];
        // console.log(data)
      connect.query(sql, params, function(err, rows, fields) {
        // console.log("req.params.wechat_id");
        if (err) {
          console.log(err);
        }
  
        res.status(200).json(rows);
      });
    } else {
      var contact_id = req.params.contact_id;
      var sql =
        "SELECT * FROM contact WHERE contact_id=? AND contact_isDeleted=0 ORDER BY contact_created DESC";
      var params = [contact_id];
  
      connect.query(sql, params, function(err, rows, fields) {
        if (err) {
          console.log(err);
        }
  
        res.status(200).json(rows);
      });
    }
})


module.exports = router;