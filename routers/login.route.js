const express = require('express');
const router = express.Router();
const passport = require('passport');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const config = require('../db/config/config.json');
const FacebookStrategy = require('passport-facebook').Strategy;

//Passport FB setup
router.use(function (req, res, next) {
    // Passport session setup. 
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    // Use FacebookStrategy with Passport.
    passport.use(new FacebookStrategy({
        clientID: config.passport_FB.FACEBOOK_CLIENT_ID,
        clientSecret: config.passport_FB.FACEBOOK_CLIENT_SECRET,
        callbackURL: config.passport_FB.callback_url_login,
        profileFields: ['id', 'displayName', 'email']
    },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                //console.log(accessToken, refreshToken, profile, done);
                return done(null, profile);
            });
        }
    ));
    next();
})
router.use(passport.initialize());
router.use(passport.session());



router.get('/', function (req, res) {
    req.session.isAuthenticated = false;
    req.session.authUser = null;

    res.render('viewLogin/_login.hbs', {
        user_name: (req.app.locals.user_name ? req.app.locals.user_name : null),
        password: (req.app.locals.password ? req.app.locals.password : null)
    });
});

// Handling logout
router.get('/logout', function (req, res) {
    req.logOut();
    req.session.destroy(function (err) {
        console.log(err);
        // res.redirect('/');
    });

    req.app.locals.lcUser = null;
    req.app.locals.lcIsAuthenticated = false;
    req.app.locals.lcSubcriber = false;
    req.app.locals.lcEditor = false;
    req.app.locals.lcWriter = false;

    res.redirect('/');
})

// Handling when receive POST request
router.post('/', async function (req, res) {

    let user = await userModel.singleByUserName(req.body.user_name);
    let us = user[0];

    let flag = false;
    if (us) {
        if (bcrypt.compareSync(req.body.password.toString(), us.password) == true && us.isPassport == 0) {
            flag = true;
            req.session.isAuthenticated = true;

            if (req.body.remmember_pass) {
                req.app.locals.user_name = req.body.user_name;
                req.app.locals.password = req.body.password
            }

            delete us.password;
            req.session.authUser = us;
        }
    }

    console.log(req.session);

    if (flag == true) {
        res.redirect('/');
    }
    else {
        res.render('viewLogin/_login.hbs', {
            error: { err: 'Tên đăng nhập hoặc mật khẩu không đúng !' }
        });
    }
});

function xoa_dau(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

// handling when success
router.get('/account', async function (req, res) {
    console.log(req.user);
    let str = req.user.displayName;
    str = xoa_dau(str);
    let matches = str.match(/\b(\w)/g);
    let user_name = matches.join('');

    let user = await userModel.singleByUserName(user_name);
    let us = user[0];

    let flag = false;

    if (us) {
        if (bcrypt.compareSync(`${req.user.id}`, us.password) && us.isPassport == 1) {
            flag = true;
            req.session.isAuthenticated = true;
            delete us.password;
            req.session.authUser = us;
        }
    }

    if (flag == true) {
        res.redirect('/');
    }
    else {
        res.render('viewLogin/_login.hbs', {
            error: { err: 'Tài khoản không tồn tại !' }
        });
    }
});

// send request to facebook API
router.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: 'email' }));

// receive call back from facebook API
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/login/account', failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/login');
    }
);

module.exports = router;