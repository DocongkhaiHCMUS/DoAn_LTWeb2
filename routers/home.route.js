const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    
    if (!req.session.athUser)
        res.render('home.hbs'); 

    else if (req.session.athUser.permission == 2)
    {
        res.render('home.hbs', {
            isWriter: true
        });
    }
    else if (req.session.athUser.permission == 33)
    {
        res.render('home.hbs', {
            isEditor: true
        });
    }
})

module.exports = router;
