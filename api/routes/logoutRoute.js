const express = require('express');
const router = express();

router.post('/',function(req,res){
    req.session.destroy();
    res.status(201).json({message:'success'});
});

module.exports = router;