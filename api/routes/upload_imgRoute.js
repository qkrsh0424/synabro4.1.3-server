const express = require('express');
const router = express();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const connect = require('../../database/database');
const cipher = require('../../handler/security');

router.use(fileUpload());

const readAliossConfig = fs.readFileSync(__dirname+'/../../accesskey/aliossconfig.json');
const aliossconfig = JSON.parse(readAliossConfig);


//AWS S3 setting
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname+'/../../accesskey/awsconfig.json');
let s3 = new AWS.S3();

let multer = require("multer");
let multerS3 = require('multer-s3');
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "v1synabro/posterImg",
        key: function (req, file, cb) {
             let extension = Date.now()+file.originalname;
            // let extension = Date.now()+cipher.makeSalt();

             cb(null,extension)
        },
        acl: 'public-read-write',
    })
});

//Alibaba Cloud OSS Setting
let OSS = require('ali-oss');

let client = new OSS({
    region: aliossconfig.region,
    accessKeyId: aliossconfig.accessKeyId,
    accessKeySecret: aliossconfig.accessKeySecret,
    bucket: aliossconfig.bucket
  });

// router.post('/richTextImg',upload.single('name'),function(req,res){
    
//     if(req.file){
//         res.status(201).json({status:'success', url:"https://ddpf5wamlzit3.cloudfront.net/posterImg/" + req.file.key});
//     }else{
//         res.status(201).json({status:'error'});
//     }
// });

// var uploadDraft = multer({ dest: '../uploads/' });

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

router.post('/draft', upload.single('file'),function(req,res){
    // console.log(req.file);
    if(req.file){
        let result ={
            message:'success',
            // url:"https://ddpf5wamlzit3.cloudfront.net/posterImg/" + req.file.key
            url:"https://v1synabro.s3-ap-southeast-1.amazonaws.com/posterImg/" + req.file.key
        }
        res.json(result);
    }else{
        let result ={
            message:'failure'
        }
        res.json(result);
    }
});

router.post('/draft-oss', async(req,res)=>{
    // console.log(req.files.file);
    let ossDirectory = 'posterImg/';
    // 구조 형태 : alicloud.com/folder/name 여기서 폴더가 ossDirectory 가되고, name이 저장되는 파일 이름이 된다.
    
    if(req.files.file.length){
        let resultDataUrlAll = [];
        for(let i=0; i<req.files.file.length;i++){
            let fileName = ossDirectory+Date.now()+'-'+String(i)+'-'+req.files.file[i].name;
            await client.put(fileName, req.files.file[i].data);
            let resultData = await client.get(fileName);
            resultDataUrlAll.push(resultData.res.requestUrls[0]);
        }
        if(resultDataUrlAll.length===req.files.file.length){
            let result = {
                message:'successMultiple',
                url: resultDataUrlAll,
                dataLength: resultDataUrlAll.length
            }
            res.json(result);
        }else{
            let result ={
                message:'failure'
            }
            res.json(result);
        }
    }else{
        let fileName = ossDirectory+Date.now()+req.files.file.name; 
        await client.put(fileName, req.files.file.data);
        let resultData = await client.get(fileName);
        if(resultData){
            let result ={
                message:'successOne',
                // url:"https://ddpf5wamlzit3.cloudfront.net/posterImg/" + req.file.key
                url: resultData.res.requestUrls[0]
            }
            res.json(result);
        }else{
            let result ={
                message:'failure'
            }
            res.json(result);
        }
    }
});

router.post('/draft-oss/file/upload', async(req,res)=>{
    let ossDirectory = 'commonFiles/';
    // console.log(req.files.commonfile.name);
    if(req.files){
        if(req.files.commonfile.length){
            let resultDataUrlAll = [];
            for(let i=0; i<req.files.commonfile.length;i++){
                let fileName = ossDirectory+Date.now()+'-'+String(i)+'-'+req.files.commonfile[i].name;
                await client.put(fileName, req.files.commonfile[i].data);
                let resultData = await client.get(fileName);
                resultDataUrlAll.push({name:req.files.commonfile[i].name,url:resultData.res.requestUrls[0]});
            }
            // console.log(resultDataUrlAll);
            if(resultDataUrlAll.length===req.files.commonfile.length){
                let result = {
                    message:'successMultiple',
                    url: resultDataUrlAll.url,
                    file:resultDataUrlAll,
                    dataLength: resultDataUrlAll.length
                }
                return res.json(result);
            }else{
                let result ={
                    message:'failure'
                }
                return res.json(result);
            }
        }else{
            let fileName = ossDirectory+Date.now()+req.files.commonfile.name; 
            await client.put(fileName, req.files.commonfile.data);
            let resultData = await client.get(fileName);
            if(resultData){
                let result ={
                    message:'successOne',
                    // url:"https://ddpf5wamlzit3.cloudfront.net/posterImg/" + req.file.key
                    file:{name:req.files.commonfile.name, url:resultData.res.requestUrls[0]},
                    url: resultData.res.requestUrls[0]
                }
                return res.json(result);
            }else{
                let result ={
                    message:'failure'
                }
                return res.json(result);
            }
        }
    }else{
        return res.json({message:'maybeEmpty'})
    }
    
})
// router.post('/draft/submit',function(req,res){
//     console.log(req.body.data);
//     res.send(req.body.data);

// });

module.exports = router;