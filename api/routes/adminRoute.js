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

router.post('/checkAdmin', function(req,res){
    // console.log(req.body.usid);
    if(req.body.usid===null){   //null or undefined
        return res.json({ message: 'error' });
    }
    const sessID = 'sess:'+cipher.decrypt(req.body.usid);
    client.exists(sessID,(err,replyExists)=>{
        if(replyExists){
            client.get(sessID,(err,replyGet)=>{
                const resultGet = JSON.parse(replyGet);
                const user_id = resultGet.user.user_id;

                let sql = `
                    SELECT * FROM member_of_group WHERE user_id=?
                `;
                let params = [user_id];

                connect.query(sql, params,function(err, rows, fields){
                    let result = [];
                    if(rows[0] && rows[0].member_type===1001){
                        return res.json({message:'success', data:rows[0].head_type});
                    }else{
                        return res.json({ message: 'error' });            
                    }
                    
                });
            });
        }else{
            return res.json({ message: 'error' });
        }
    });
})

router.post('/group/members/all', function(req,res){
    let sql = `
        SELECT * FROM member_of_group
        JOIN user ON member_of_group.user_id=user.user_id
        WHERE member_of_group.head_type=? AND member_of_group.member_type!=1001 AND member_of_group.member_type!=1000 AND member_isDeleted=0
    `;
    let params = [req.body.head_type];
    connect.query(sql, params, function(err, rows ,fields){
        let result = [];
        if(rows[0]){
            for(let i = 0 ;i<rows.length;i++){
                let data = {
                    UserId:cipher.decrypt(rows[i].user_uid),
                    UserName:cipher.decrypt(rows[i].user_name),
                    UserNickname:rows[i].user_nickname,
                    UserJob:rows[i].user_job,
                    UserMajor:rows[i].user_major,
                    UserEmail:cipher.decrypt(rows[i].user_email),
                    UserGender:rows[i].user_gender,
                    MemberId : rows[i].member_id
                }
                result.push(data);
            }
            // console.log(cipher.decrypt(rows[0].user_name,authkey.accessKey));
            res.json({message:'success', data:result});
        }else{
            res.json({message:'none'});
        }
        
    });
});

router.post('/group/applicant/all', function(req,res){
    let sql = `
        SELECT * FROM member_apply
        JOIN user ON member_apply.user_id=user.user_id
        WHERE member_apply.head_type=? AND memap_isDeleted=0
    `;
    let params = [req.body.head_type];
    connect.query(sql, params, function(err, rows ,fields){
        let result = [];
        if(rows[0]){
            for(let i = 0 ;i<rows.length;i++){
                let data = {
                    ApplicantId:rows[i].memap_apply_id,
                    UserId:cipher.decrypt(rows[i].user_uid),
                    UserName:cipher.decrypt(rows[i].user_name),
                    UserNickname:rows[i].user_nickname,
                    UserJob:rows[i].user_job,
                    UserMajor:rows[i].user_major,
                    UserEmail:cipher.decrypt(rows[i].user_email),
                    UserGender:rows[i].user_gender,
                    ApplyReason:rows[i].memap_introduce_self
                }
                result.push(data);
            }
            // console.log(cipher.decrypt(rows[0].user_name,authkey.accessKey));
            res.json({message:'success', data:result});
        }else{
            res.json({message:'none'});
        }
        
    });
});

router.post('/group/confirmApply', function(req,res){

    // console.log(req.body.applicantId, req.body.head_type);

    let sql = `
        SELECT * FROM member_apply
        WHERE head_type=? AND memap_apply_id=?
    `;
    let params = [req.body.head_type, req.body.applicantId];
    connect.query(sql, params, function(err, applicantUser ,fields){
        if(applicantUser[0]){
            let sql = `
                INSERT INTO member_of_group(head_type,user_id)
                VALUES (?,?)
            `;
            let params=[req.body.head_type, applicantUser[0].user_id];
            connect.query(sql,params, function(err, insertResult, fields){
                if(insertResult){
                    let sql = `
                        UPDATE member_apply SET memap_isDeleted=1 WHERE memap_apply_id=?
                    `;
                    let params = [applicantUser[0].memap_apply_id];
                    connect.query(sql, params, function(err, result, fields){
                        if(result){
                            res.json({message:'success'});
                        }else{
                            res.json({message:'error'});        
                        }
                    })
                }else{
                    res.json({message:'error'});        
                }
            })
        }else{
            res.json({message:'error'});
        }
    });
});

router.post('/group/rejectApply', function(req,res){
    let sql = `
        SELECT * FROM member_apply
        WHERE head_type=? AND memap_apply_id=?
    `;
    let params = [req.body.head_type, req.body.applicantId];
    connect.query(sql, params, function(err, applicantUser ,fields){
        if(applicantUser[0]){
            let sql = `
                UPDATE member_apply SET memap_isDeleted=2 WHERE memap_apply_id=?
            `;
            let params = [applicantUser[0].memap_apply_id];
            connect.query(sql, params, function(err, result, fields){
                if(result){
                    res.json({message:'success'});
                }else{
                    res.json({message:'error'});        
                }
            })
        }else{
            res.json({message:'error'});
        }
    });
});

router.post('/group/deleteMember/one', function(req,res){
    // console.log(req.body.head_type,req.body.member_id);
    let sql = `
        UPDATE member_of_group 
        SET member_isDeleted=1 
        WHERE head_type=? AND member_id=?
    `;
    let params = [req.body.head_type,req.body.member_id];
    connect.query(sql, params, function(err,rows,fields){
        let sql = `
            UPDATE member_apply
            JOIN member_of_group
            ON member_apply.user_id=member_of_group.user_id
            SET memap_isDeleted=3 
            WHERE member_apply.head_type=? AND member_of_group.member_id=?
        `;
        let params = [req.body.head_type, req.body.member_id];
        connect.query(sql, params, function(err,rows2){
            if(rows.affectedRows===0 || rows2.affectedRows===0){
                return res.json({message:'invalid'});
            }else{
                return res.json({message:'success'});
            }
        })
        
    });
    // let sql = `
    //     SELECT * FROM member_apply
    //     WHERE head_type=? AND memap_apply_id=?
    // `;
    // let params = [req.body.head_type, req.body.applicantId];
    // connect.query(sql, params, function(err, applicantUser ,fields){
    //     if(applicantUser[0]){
    //         let sql = `
    //             UPDATE member_apply SET memap_isDeleted=2 WHERE memap_apply_id=?
    //         `;
    //         let params = [applicantUser[0].memap_apply_id];
    //         connect.query(sql, params, function(err, result, fields){
    //             if(result){
    //                 res.json({message:'success'});
    //             }else{
    //                 res.json({message:'error'});        
    //             }
    //         })
    //     }else{
    //         res.json({message:'error'});
    //     }
    // });
});

router.post('/category/header/updateName', function(req,res){
    // console.log(req.body.targetId);
    // console.log(req.body.targetName);
    let sql = `
        UPDATE shb_item_header 
        SET sih_name = ?
        WHERE sih_id = ?
    `;

    let params = [req.body.targetName,req.body.targetId]
    connect.query(sql, params, function(err,rows){
        res.json({message:'success'});
    });
});

router.post('/category/header/delete/one', function(req,res){
    // console.log(req.body.targetId);
    // console.log(req.body.targetName);
    let sql = `
        UPDATE shb_item_header 
        SET sih_isDeleted = 1
        WHERE sih_id = ?
    `;

    let params = [req.body.targetId]
    connect.query(sql, params, function(err,rows){
        res.json({message:'success'});
    });
});

router.post('/category/header/add/one', function(req,res){
    let sql = `
        INSERT INTO shb_item_header(shb_num, sih_name, parent_route)
        VALUES(?,?,?)
    `;

    let params = [req.body.head_type,req.body.sih_name, req.body.parent_route]
    connect.query(sql, params, function(err,rows){
        if(err){
            console.log(err);
            return res.json({message:'error'})
        }
        return res.json({message:'success'});
    });
});

router.post('/category/header/arraySet', function(req,res){
    // console.log(req.body.visibleArray);
    // console.log(req.body.invisibleArray);

    //visibleArrayPart
    for(let i = 0; i< req.body.visibleArray.length; i++){
        let sql = `
            UPDATE shb_item_header
            SET sih_visible=1, sih_order=?
            WHERE sih_id=?
        `;
        let params=[i,req.body.visibleArray[i].sih_id];
        connect.query(sql, params, function(err,rows){
            if(err){
                console.log(err);
                return res.json({message:'error'});
            }
        })
    }

    //invisibleArrayPart
    for(let i = 0; i< req.body.invisibleArray.length; i++){
        let sql = `
            UPDATE shb_item_header
            SET sih_visible=0, sih_order = NULL
            WHERE sih_id=?
        `;
        let params=[req.body.invisibleArray[i].sih_id];
        connect.query(sql, params, function(err,rows){
            if(err){
                console.log(err);
                return res.json({message:'error'});
            }
            let sql = `
                UPDATE shb_item
                SET shb_item_visible=0, shb_item_order = NULL
                WHERE parent_header=?
            `;
            let params=[req.body.invisibleArray[i].sih_id];
            connect.query(sql, params, function(err, rows2){
                if(err){
                    console.log(err);
                    return res.json({message:'error'});
                }
            })
        })
    }
    return res.json({message:'success'});
});

router.get('/category/sub/getshbItemAll', function(req,res){
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

router.post('/category/sub/updateName', function(req,res){
    // console.log(req.body.targetId);
    // console.log(req.body.targetName);
    let sql = `
        UPDATE shb_item
        SET shb_item_name = ?
        WHERE shb_item_id = ?
    `;

    let params = [req.body.targetName,req.body.targetId]
    connect.query(sql, params, function(err,rows){
        if(err){
            console.log(err);
            return res.json({message:'error'});
        }
        return res.json({message:'success'});
    });
});

router.post('/category/sub/delete/one', function(req,res){
    // console.log(req.body.targetId);
    // console.log(req.body.targetName);
    let sql = `
        UPDATE shb_item 
        SET shb_item_isDeleted = 1
        WHERE shb_item_id = ?
    `;

    let params = [req.body.targetId]
    connect.query(sql, params, function(err,rows){
        if(err){
            console.log(err);
            return res.json({message:'error'});
        }
        return res.json({message:'success'});
    });
});

router.post('/category/sub/add/one', function(req,res){
    const headerItem = req.body.headerItem;
    const newName = req.body.newName;
    const itemClassify = 'board';
    let sql = `
        INSERT INTO shb_item(shb_item_name, shb_item_classify, shb_num, parent_route, parent_header)
        VALUES(?,?,?,?,?)
    `;
    let params = [newName, itemClassify, headerItem.shb_num, headerItem.parent_route, headerItem.sih_id];
    connect.query(sql, params, function(err, rows){
        if(err){
            return res.json({message:'error'});
        }
        return res.json({message:'success'});
    })
    
});

router.post('/category/sub/arraySet', function(req,res){
    // console.log(req.body.visibleArray);
    // console.log(req.body.invisibleArray);

    //visibleArrayPart
    for(let i = 0; i< req.body.visibleArray.length; i++){
        let sql = `
            UPDATE shb_item
            SET shb_item_visible=1, shb_item_order=?
            WHERE shb_item_id=?
        `;
        let params=[i,req.body.visibleArray[i].shb_item_id];
        connect.query(sql, params, function(err,rows){
            if(err){
                console.log(err);
                return res.json({message:'error'});
            }
        })
    }

    //invisibleArrayPart
    for(let i = 0; i< req.body.invisibleArray.length; i++){
        let sql = `
            UPDATE shb_item
            SET shb_item_visible=0, shb_item_order = NULL
            WHERE shb_item_id=?
        `;
        let params=[req.body.invisibleArray[i].shb_item_id];
        connect.query(sql, params, function(err,rows){
            if(err){
                console.log(err);
                return res.json({message:'error'});
            }
        })
    }
    return res.json({message:'success'});
});

// /api/auth/admin/pageInfo/update
router.post('/pageInfo/update',function(req,res){
    const group = req.body.group;
    let sql = `
        UPDATE shb SET shb_introduce=?, shb_image_url=?, shb_icon_url=?
        WHERE shb_id=? AND shb_num=?
    `;
    let params = [group.shb_introduce, group.shb_image_url, group.shb_icon_url, group.shb_id, group.shb_num];

    connect.query(sql, params, function(err, rows){
        if(err){
            console.log(err);
            return res.json({message:'error'});
        }
        return res.json({message:'success'});
    })
})
module.exports = router;