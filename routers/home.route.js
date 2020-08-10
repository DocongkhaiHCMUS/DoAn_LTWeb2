const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    
    if (!req.session.authUser)
        res.render('home.hbs'); 

    else if (req.session.authUser.permission == 2)
    {
        res.render('home.hbs', {
            isWriter: true,
            id: req.session.authUser.id
        });
    }
    else if (req.session.authUser.permission == 33)
    {
        res.render('home.hbs', {
            isEditor: true
        });
    }
})

module.exports = router;
