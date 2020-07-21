const express = require('express');
const router = express.Router();
const passport = require('passport');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');

app = express();

router.get('/', function (req, res) {
    req.session.isAuthenticated = false;
    req.session.authUser = null;

    res.render('viewLogin/_login.hbs', {
        user_name: app.locals.user_name,
        password: app.locals.password
    });
});

// Handling logout
router.get('/logout', function (req, res) {
    req.logOut();
    req.session.destroy(function (err) {
        res.redirect('/');
    });
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
            delete us.password;
            req.session.authUser = us;
        }
    }

    console.log(req.session);

    if (flag == true) {

        if (req.body.remmember_pass) {

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
router.get('/account', ensureAuthenticated, async function (req, res) {
    console.log(req.user);
    let str = req.user.displayName;
    str = xoa_dau(str);
    let matches = str.match(/\b(\w)/g);
    let user_name = matches.join('');

    let user = await userModel.singleByUserName(user_name);
    let us = user[0];

    let flag = false;

    if (bcrypt.compareSync(`${req.user.id}`, us.password) && us.isPassport == 1) {
        flag = true;
        req.session.isAuthenticated = true;
        delete us.password;
        req.session.authUser = us;
    }

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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports = router;