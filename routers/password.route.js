const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const nodemailer = require('nodemailer');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

router.get('/change', async function (req, res) {
    if (!req.session.isAuthenticated) {
        res.redirect('/');
    }
    else {
        res.render('viewPass/change');
        req.session.prevURL = req.headers.referer;
    }
})

router.post('/change', async function (req, res) {
    let user = await userModel.singleByID(req.session.authUser.id);
    var us = user[0];
    console.log(us);
    var oldpass = req.body.old_password;
    var newpass = req.body.new_password;
    // var firmpass = req.body.firm_password;
    var rs = bcrypt.compareSync(oldpass.toString(), us.password);
    if (rs === false) {
        return res.render('viewPass/change', {
            err: 'Old password Invalid.'
        })
    }
    us.password = bcrypt.hashSync(newpass, 10);
    userModel.patch(us);
    res.redirect(req.session.prevURL);
})
router.get('/forgot', function (req, res) {
    res.render('viewPass/forgot');
});

var generateToken = (user, secretSignature, tokenLife) => {
    return new Promise((resolve, reject) => {
        // Định nghĩa những thông tin của user muốn lưu vào token ở đây
        const userData = {
            id: user.id,
            user_name: user.user_name,
            email: user.email,
        }
        // Thực hiện ký và tạo token
        jwt.sign(
            { data: userData },
            secretSignature,
            {
                algorithm: "HS256",
                expiresIn: tokenLife,
            },
            (error, token) => {
                if (error) {
                    return reject(error);
                }
                resolve(token);
            });
    });
}

var verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded);
        });
    });
}
//60000 = 60s

const accessTokenSecret = "access-token-secret-@hiep";
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
router.post('/forgot', async function (req, res) {
    const user = await userModel.singleByUserName(req.body.username);
    const us = user[0];
    if (!us) {
        res.render('viewPass/forgot.hbs', {      
            err: 'Username does not exist.'
        });
    }
    else {
        var transporter = nodemailer.createTransport({ // config mail server
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAILER_EMAIL_ID || "lnhiep120699@gmail.com", //Tài khoản gmail server
                pass: process.env.MAILER_PASSWORD || "hiepktvn99" //Mật khẩu tài khoản gmail server
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
        const userData = {
            id: us.id,
            user_name: us.user_name,
            email: us.email,
        };
        const accessToken = await generateToken(userData, accessTokenSecret, accessTokenLife);
        var content = '';
        content += `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Dear ${us.display_name}</h4>
                <span style="color: black">You have selected to reset password for ${us.user_name}</span>
                <p> Your OTP : <b>${accessToken}</b></p> 
                <p style="color: red"> This code will expire ${accessTokenLife} after this email was send</p> 
                <p> If you did not make this request , you can ignore this email </p> 
            </div>
        </div>
    `;
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'NQH-Test nodemailer',
            to: us.email,
            subject: 'Reset password',
            text: 'Your text is here',
            html: content //Nội dung html đã tạo trên kia 
        }
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                res.render('viewPass/forgot.hbs', {                
                    err
                });
            } else {
                us.accessToken = accessToken;
                userModel.patch(us);
                console.log('Message sent: ' + info.response);
                res.render('viewPass/newpass');
            }
        });
    }

});

router.post('/new', async function (req, res) {
    // xử lí update password
    const newPass = req.body.password;
    const rePass = req.body.firmpassword;
    const token = req.body.otp;
        try {
            const decoded = await verifyToken(token, accessTokenSecret);
            const user = await userModel.singleByID(decoded.data.id);
            const us = user[0];
            if (token === us.accessToken) {
                us.password = bcrypt.hashSync(rePass, 10);
                userModel.patch(us);
                res.redirect('/login');
            }
            else{
                res.render('viewPass/newpass.hbs', {
                    err: 'OTP invalid'
                });
            }
        } catch (error) {
            res.render('viewPass/newpass.hbs', {          
                err: 'OTP invalid or expired.'
            });
        }
});

module.exports = router;