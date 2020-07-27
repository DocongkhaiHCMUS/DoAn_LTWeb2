const express = require('express');
const router = express.Router();
const modelComment = require('../models/user-comment.model');
const moment = require('moment');

router.post('/', async function (req, res) {
    let comment = req.body.txtComment;
    let user = req.body.txtUser;
    let post = req.body.txtPost;
    let time_comment = moment().format('YYYY/MM/DD HH:mm:ss');
    let us_comment = {
        user,
        post,
        comment,
        time_comment
    };

    console.log(us_comment);

    await modelComment.add(us_comment);
    res.redirect(`/post/${post}`);
});

module.exports = router;
