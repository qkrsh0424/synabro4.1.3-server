const express = require('express');
const router = express();
const connect = require('../../database/database');

let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname+'/../../accesskey/awsconfig.json');
let s3 = new AWS.S3();

let multer = require("multer");
let multerS3 = require('multer-s3');
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "synabrodemo/posterImg",
        key: function (req, file, cb) {
             let extension = Date.now()+file.originalname;
             cb(null,extension)
        },
        acl: 'public-read-write',
    })
});

router.post('/richTextImg',upload.single('name'),function(req,res){
    if(req.file){
        res.status(201).json({status:'success', url:"https://ddpf5wamlzit3.cloudfront.net/posterImg/" + req.file.key});
    }else{
        res.status(201).json({status:'error'});
    }
});

module.exports = router;