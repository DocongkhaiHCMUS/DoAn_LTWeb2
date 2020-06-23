const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/util/db.json');
const router = express.Router();

router.get('/change', function (req, res) {
    res.render('viewPass/change', {
        layout: false
    });
})
router.post('/change', function (req, res) {
    var user = db.getData();
    const oldpass = req.body.old_password;
    const newpass = req.body.new_password;
    const firmpass = req.body.firm_password;
    const rs = bcrypt.compareSync(oldpass, user.password);
    if (rs === false) {
        return res.render('viewPass/change', {
            err: 'Old password Invalid.',
            layout: false
        })
    }
    if (newpass != firmpass) {
        return res.render('viewPass/change', {
            err: 'New password incorrect.',
            layout: false
        })
    }
    user.password = bcrypt.hashSync(firmpass,10);
    db.setData(user);
    res.redirect('/pass/change');
})
module.exports = router;