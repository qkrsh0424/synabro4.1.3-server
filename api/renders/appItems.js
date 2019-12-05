const express = require('express');
const router = express();
const cipher = require('../../handler/security');
const authkey = require('../../accesskey/authkey.json');
const connect = require('../../database/database');

var redis = require('redis'),
    client = redis.createClient();

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

router.get('/items/all', async(req,res)=>{
    let parent_routeSql = `
        SELECT * FROM parent_route
    `;
    connect.query(parent_routeSql,function(err,parent_routeRows){
        const parent_route = parent_routeRows;
        let itemsSql = `
            SELECT * FROM shb_item
        `;
        connect.query(itemsSql, function(err,itemsRows){
            const items = itemsRows;

            
            let parentLoop = ``;

            for(let i  = 0 ; i<items.length;i++){
                if(items[i].parent_route==='main'){
                    parentLoop += `<a href='/'>${items[i].shb_item_name} </a> | `;
                }
                
            }
            let sendHtml = `
                <div class='container'>
                    ${parentLoop}
                </div>
            `;
            res.send(sendHtml);
        });
    })
    
    
    
})

module.exports = router;