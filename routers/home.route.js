const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {

    if (!req.session.authUser)
        res.render('home.hbs');

    else if (req.session.authUser.permission == 2) {
        res.render('home.hbs', {
            isWriter: true
        });
    }

    else if (req.session.authUser.permission == 3) {
        res.render('home.hbs', {
            isEditor: true
        });
    }

    else if (req.session.authUser.permission == 4)
    {
        res.redirect('/admin');
    }
})

module.exports = router;
