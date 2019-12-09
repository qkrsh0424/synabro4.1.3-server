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

router.get('/getParentRoute/all', function(req,res){
    let sql = `
        SELECT * FROM parent_route
        WHERE route_isDeleted=0 AND parent_route!=?
        ORDER BY route_order
    `;
    let params = ['main'];
    connect.query(sql,params,function(err,rows,fields){
        if(rows[0]){
            res.json({message:'success',data:rows});
        }else{
            res.json({message:'failure'});
        }
        
    });
});

router.get('/getshbAll',function(req,res){
    if(req.query.type){
        let sql = `
            SELECT * FROM shb
            WHERE shb_classify=? AND shb_isDeleted=0
            ORDER BY shb_order
        `;
        let params = [req.query.type];

        connect.query(sql, params, function(err, rows, fields){
            if(err){
                res.json({message:'DBerror'});
            }else{
                if(!rows){
                    res.json({message:"failure"})
                }else{
                    res.json({message:'success', data:rows});
                }
            }
        });
    }else{
        let sql = `
            SELECT * FROM shb
            WHERE shb_isDeleted=0
            ORDER BY shb_order
        `;

        connect.query(sql, function(err, rows, fields){
            if(err){
                res.json({message:'DBerror'});
            }else{
                let mainCategory;
                for(let i = 0; i<rows.length; i++){
                    if(rows[i].shb_num===1101001){
                        mainCategory=rows[i];
                    }
                }
                res.json({message:'success', data:rows, main:mainCategory});
            }
        });
    }
    
});

router.get('/getshbOne',function(req,res){
        let sql = `
            SELECT * FROM shb
            WHERE shb_num=? AND shb_isDeleted=0
        `;
        let params = [req.query.shb_num];

        connect.query(sql, params, function(err, rows, fields){
            if(err){
                res.json({message:'DBerror'});
            }else{
                if(rows[0]){
                    res.json({message:'success', data:rows});
                }else{
                    res.json({message:"failure"});
                }
            }
        });
    
});

router.get('/getshbItemHeader/all', function(req,res){
    const shb_num = req.query.shb_num;
    let sql = `
        SELECT * FROM shb_item_header
        WHERE sih_isDeleted=0 AND shb_num=?
        ORDER BY ISNULL(sih_order) ASC, sih_order ASC
    `;
    let params = [shb_num];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            console.log(err)
            res.json({message:'DBerror'});
        }else{
            if(rows[0]){
                res.json({message:'success', data:rows});
            }else{
                res.json({message:'failure'});
            }
            
        }
    });
});

router.get('/getshbItemAll', function(req,res){
    const shb_num = req.query.shb_num;
    let sql = `
        SELECT * FROM shb_item
        WHERE shb_item_isDeleted=0 AND shb_num=?
        ORDER BY ISNULL(shb_item_order) ASC, shb_item_order ASC
    `;
    let params = [shb_num];

    connect.query(sql, params, function(err, rows, fields){
        if(err){
            console.log(err)
            res.json({message:'DBerror'});
        }else{
            if(rows[0]){
                res.json({message:'success', data:rows});
            }else{
                res.json({message:'failure'});
            }
            
        }
    });
});

router.get('/shbItem/getOne', function(req,res){
    let sql = `
        SELECT shb_item.*, shb.shb_name FROM shb_item
        JOIN shb ON shb_item.shb_num=shb.shb_num
        WHERE shb_item.shb_item_id=? AND shb_item.shb_num=?
    `;
    let params = [req.query.shb_item_id, req.query.shb_num];
    connect.query(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
            res.json({message:'DBerror'})
        }else{
            if(rows[0]){
                res.json({message:'success', data:rows[0]});
            }else{
                res.json({message:'failure'});
            }
            
        }
    })
})

module.exports = router;