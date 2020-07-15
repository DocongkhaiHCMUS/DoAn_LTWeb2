const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/util/db.json');
const router = express.Router();
const nodemailer = require('nodemailer');
const userModel = require('../models/user.model');
router.get('/change',async function (req, res) {
    if (!req.session.isAuthenticated) {     
        res.redirect('/');
    }
    else {            
        res.render('viewPass/change', {
            layout: false
        });
    }
})
router.post('/change',async function (req, res) {
    let user = await userModel.singleByID(req.session.authUser.id);
    var us = user[0];
    console.log(us);
    var oldpass = req.body.old_password;
    var newpass = req.body.new_password;
    var firmpass = req.body.firm_password;
    var rs = bcrypt.compareSync(oldpass, us.password);
    if (rs === false) {
        return res.render('viewPass/change', {
            err: 'Old password Invalid.',
            layout: false
        })
    }
    if (newpass != firmpass) {
        return res.render('viewPass/change', {
            err: 'Re-password incorrect.',
            layout: false
        })
    }
    us.password = bcrypt.hashSync(firmpass, 10);
    userModel.patch(us);
    res.redirect('/');
})
router.get('/forgot', function (req, res) {
    res.render('viewPass/forgot', {
        layout: false
    });
});
function DestroyOTP(otp) {
    otp = 0;
}
router.post('/forgot', function (req, res) {
    var transporter = nodemailer.createTransport({ // config mail server
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'lnhiep120699@gmail.com', //Tài khoản gmail vừa tạo
            pass: 'hiepktvn99' //Mật khẩu tài khoản gmail vừa tạo
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    var OTP = Math.trunc(Math.random() * (999999 - 100000) + 100000);
    var content = '';
    content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Dear HiepGa</h4>
                <span style="color: black">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản hiepkt</span>
                <p> Mã OTP của bạn là : <b>${OTP}</b></p> 
                <p style="color: red"> Mã sẽ hết hạn sau 3 giờ </p> 
                <p> Vui lòng không phản hồi lại thư này </p> 
            </div>
        </div>
    `;
    var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
        from: 'NQH-Test nodemailer',
        to: 'hiepc3kt@gmail.com',
        subject: 'Đặt lại mật khẩu',
        text: 'Your text is here',
        html: content //Nội dung html mình đã tạo trên kia :))
    }
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
            req.flash(mess, 'Lỗi gửi mail: ' + err); //Gửi thông báo đến người dùng
            res.redirect('/pass/forgot', err);
        } else {
            console.log('Message sent: ' + info.response);
            //   mess = 'Một email đã được gửi đến tài khoản của bạn'
            req.flash(mess, 'Một email đã được gửi đến tài khoản của bạn'); //Gửi thông báo đến người dùng
            res.render('viewPass/newpass', {
                layout: false
            });
        }
    });
    var data = {
        OTP: OTP,
        id: 1
    }
    res.render('viewPass/newpass', {
        layout: false, data
    });
    setTimeout(DestroyOTP(OTP), 86400000);
})
router.get('/new', function (req, res) {
    res.render('viewPass/newpass', {
        layout: false
    });
});
router.post('/new', function (req, res) {
    // xử lí update password
    res.render('viewPass/newpass', {
        layout: false,
        err: 'Re-password Invalid.'
    });
});
module.exports = router;