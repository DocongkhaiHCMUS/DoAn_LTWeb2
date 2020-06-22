const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
    res.render('viewLogin/login.hbs',{layout: false});
});

module.exports = router;