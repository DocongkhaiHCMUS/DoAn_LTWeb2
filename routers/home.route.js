const express = require('express');
const router = express.Router();

// router.use(function (req, res, next) {
//     req.app.set('view options', { layout: 'other' });
//     next();
// })

router.get('/', function (req, res) {

    if (!req.session.authUser)
        res.render('home.hbs');
    else if (req.session.authUser.permission == 1)
        res.render('home.hbs');
    else if (req.session.authUser.permission == 2) {
        res.render('home.hbs');
    }
    else if (req.session.authUser.permission == 3) {
        res.render('home.hbs');
    }
    else if (req.session.authUser.permission == 4) {
        res.redirect('/admin');
    }
})

module.exports = router;
