const express = require('express');
const router = express.Router();
const modelUser = require('../models/user.model');
const bcrypt = require('bcrypt');
const moment = require('moment');
const passport = require('passport');
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
        callbackURL: config.passport_FB.callback_url_register,
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
    res.render('viewRegister/register.hbs');
})

router.get('/is-available', async function (req, res) {
    const user = await modelUser.singleByUserName(req.query.user);
    console.log(user);
    if (!user[0]) {
        return res.json(true);
    }
    return res.json(false);
})

//handling post
router.post('/', function (req, res) {
    const hashPass = bcrypt.hashSync(req.body.password, 11);

    let new_user = {
        user_name: req.body.user_name,
        display_name: req.body.display_name,
        password: hashPass,
        email: req.body.email,
        DOB: moment(req.body.dob, 'DD/MM/YYYY').format('YYY/MM/YYY'),
        permission: 1,
        time_out: moment().add(5,'minute').format("YYYY/MM/DD HH:mm:ss")
    }

    // console.log(new_user);
    modelUser.add(new_user);
    res.redirect('/login');
})

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

// handling FB when success
router.get('/account', async function (req, res) {
    let str = req.user.displayName;
    str = xoa_dau(str);
    let matches = str.match(/\b(\w)/g);
    let user_name = matches.join('');

    let user = await modelUser.singleByUserName(user_name);
    let us = user[0];

    if (!us) {
        const hashPass = bcrypt.hashSync(req.user.id, 11);

        let new_user = {
            user_name: user_name,
            display_name: req.user.displayName,
            password: hashPass,
            email: req.user.email,
            DOB: moment(req.user.dob, 'DD/MM/YYYY'),
            permission: 1,
            time_out: moment("00/00/0000", 'DD/MM/YYYY'),
            isPassport: 1
        }
        
        modelUser.add(new_user);
        res.redirect('/login');
    }
    else {
        res.render('viewRegister/register.hbs', {
            error: { err: 'Tài khoản đã tồn tại !' }
        });
    }
});

// send request to facebook API
router.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: 'email' }));

// receive call back from facebook API
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/register/account', failureRedirect: '/register' }),
    function (req, res) {
        res.redirect('/register');
    }
);


module.exports = router;