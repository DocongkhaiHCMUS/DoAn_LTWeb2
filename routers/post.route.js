const express = require('express');
const router = express.Router();
const modelPost = require('../models/post.model');
const modelTagPost = require('../models/tag-post.model');
const modelImageCaption = require('../models/img-caption.route');
const modelCategory = require('../models/category.model');
const modelComment = require('../models/user-comment.model');
const moment = require('moment');

function handlingP(str, img_cap, pos_cap) {
    //replace image
    if (str.includes('+++')) {
        str =
            `<figure>
            <img src="/public/img/img_post/${img_cap[pos_cap.i].folder}/${img_cap[pos_cap.i].name_img}.jpg" alt="" style="width:100%">
            <figcaption>${img_cap[pos_cap.i].caption}</figcaption>
        </figure>`;
        pos_cap.i = pos_cap.i + 1;
    }

    if (str.includes('xxx')) {

        str =
            `<figure>
            <img src="/public/img/img_post/${img_cap[pos_cap.i].folder}/${img_cap[pos_cap.i].name_img}.jpg" alt="" style="width:100%">
        </figure>`;
        pos_cap.i = pos_cap.i + 1;
    }

    //replace special text
    let pat = /<em\*\* ([^\<\>\*]+) \*\*em>/g;
    let pat_1 = /<em\*\* ([^\<\>\*]+) \*\*em>\s*\r\n/g;
    if (pat_1.test(str)) {
        str = str.replace(pat_1, function (x, group1) {
            return `<\p><p class="post_des"><em>${group1}</em></p><p class="post_des">`;
        });
    }
    else if (pat.test(str)) {
        str = str.replace(pat, function (x, group1) {
            return `<em>${group1}</em>`;
        });
    }

    let pat1 = /<strong\*\* ([^\<\>\*]+) \*\*strong>/g;
    let pat1_1 = /<strong\*\* ([^\<\>\*]+) \*\*strong>\s*\r\n/g;
    if (pat1_1.test(str)) {
        str = str.replace(pat1_1, function (x, group1) {
            return `<\p><p class="post_des"><strong>${group1}</strong></p><p class="post_des">`;
        });
    }
    else if (pat1.test(str)) {
        str = str.replace(pat1, function (x, group1) {
            return `<strong>${group1}</strong>`;
        });
    }


    let pat2 = /<under\*\* ([^\<\>\*]+) \*\*under>/g;
    let pat2_1 = /<under\*\* ([^\<\>\*]+) \*\*under>\s*\r\n/g;
    if (pat2_1.test(str)) {
        str = str.replace(pat1_1, function (x, group1) {
            return `<\p><p class="post_des"><u>${group1}</u></p><p class="post_des">`;
        });
    }
    else if (pat2.test(str)) {
        str = str.replace(pat2, function (x, group1) {
            return `<u>${group1}</u>`;
        });
    }

    let pat3 = /<sup\*\* ([^\<\>\*]+) \*\*sup>/g;
    if (pat3.test(str)) {
        str = str.replace(pat3, function (x, group1) {
            return `<sup>${group1}</sup>`;
        });
    }

    //push into p
    str = `<p class="post_des">${str}</p>`;

    return str;
}

//handling post
function convertContent(post, img_cap) {
    let content = post.full_des;
    let res = content.split("\r\n\r");

    var pos_cap = { 'i': 0 }
    for (let i = 0; i < res.length; i++) {
        res[i] = { 'text': handlingP(res[i], img_cap, pos_cap) };
    }

    post.full_des = res;
    return post;
}

router.get('/:id', async function (req, res) {

    const id = +req.params.id || -1;
    let post_raw = await modelPost.singleByID(id);
    let post = post_raw[0];

    //relative post
    let relPost_raw = await modelPost.singleByIDCat2(post.category);
    let relPost = [];
    let randomPost = [];
    for (let i = 0; i < 5; i++) {
        let temp;
        do {
            temp = Math.floor(Math.random() * relPost_raw.length);
        } while (randomPost.includes(temp));
        randomPost[i] = temp;
        relPost[i] = { 'relPost': relPost_raw[temp] };
    }

    //category
    let category = await modelCategory.singleCatByIDCat2(post.category);
    post.category = category[0];

    // tag
    let tag = await modelTagPost.singleByPost(id);
    for (let i = 0; i < tag.length; i++) {
        tag[i] = { 'tag': tag[i] };
    }

    // image_caption
    let img_cap = await modelImageCaption.singleByFolder(post.folder_img);
    post = convertContent(post, img_cap);

    // comment
    let listComment = await modelComment.loadByPost(post.id);
    listComment.sort(function (a, b) {
        moment.locale('vi');
        return moment(b.publish_date).diff(moment(a.publish_date), 'days');
    })

    post['listComment'] = listComment;

    // add list tag into post
    post['listTag'] = tag;


    res.render('viewPost/_post.hbs', {
        post,
        relPost
    });

});

module.exports = router;