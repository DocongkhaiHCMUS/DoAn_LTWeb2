const express = require('express');
const router = express.Router();
const db = require('../db/util/db.json');
const passport = require('passport')

app = express();

router.get('/', function (req, res) {
    req.session.isAuthenticated = false;
    req.session.authUser = null;

    res.render('viewLogin/login.hbs', {
        layout: false,
        user_name: app.locals.user_name,
        password: app.locals.password
    });
});

router.post('/logout', function (req, res) {
    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect('/');
})

router.post('/', async function (req, res) {

    var users = db.getData().users;

    var flag = false;
    var us = null;
    for (var item of users) {
        if (req.body.user_name == item.user_name && req.body.password == item.password) {
            flag = true;
            us = item;
            break;
        }
    }

    // if (bcrypt.compare(req.body.Password.toString(), user.password)) {
    //     flag = true;
    // }

    req.session.isAuthenticated = true;
    req.session.authUser = us;

    if (flag == true) {

        if (req.body.remmember_pass) {
            app.locals.user_name = req.body.user_name;
            app.locals.password = req.body.password;
        }

        // if (user.permission == false || user.permission == 0) {
        //     if (user.attend == true || user.attend == 1) {
        //         res.render('viewLogin/loginSuccess.hbs', {
        //             title: config[0].res_agree,
        //             is_user: true
        //         });
        //     }
        //     else {
        //         res.render('viewLogin/loginSuccess.hbs', {
        //             title: config[0].res_disagree,
        //             is_user: true
        //         });
        //     }
        // }
        // else {
        //     res.redirect('/admin/admin.html');
        // }


        res.send("Login success !");
    }
    else {
        res.render('viewLogin/login.hbs', {
            layout: false,
            error: { err: 'Username or password is incorrect !' }
        });
    }
});

router.get('/account',ensureAuthenticated, function (req, res) {
    console.log(req.user);
    res.send(`Xin chào : ${req.user.displayName} ; id : ${req.user.id}`);
});

router.post('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/login/account', failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/login');
    }
);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports = router;