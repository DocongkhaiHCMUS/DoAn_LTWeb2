const express = require('express');
const router = express.Router();
const modelUser = require('../models/user.model');
const bcrypt = require('bcrypt');
const moment = require('moment');


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

router.post('/', function (req, res) {
    const hashPass = bcrypt.hashSync(req.body.password, 11);

    let new_user = {
        user_name: req.body.user_name,
        display_name: req.body.display_name,
        password: hashPass,
        email: req.body.email,
        DOB: moment(req.body.dob, 'DD/MM/YYYY'),
        permission: 1,
        time_out: moment("00/00/0000", 'DD/MM/YYYY')
    }

    // console.log(new_user);
    modelUser.add(new_user);
    res.redirect('/login');
})


module.exports = router;