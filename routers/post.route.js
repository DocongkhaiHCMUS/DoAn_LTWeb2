const express = require('express');
const router = express.Router();
const modelPost = require('../models/post.model');
const modelTagPost = require('../models/tag-post.model');
const modelImageCaption = require('../models/img-caption.route');
const modelCategory = require('../models/category.model');
const modelComment = require('../models/user-comment.model');
const moment = require('moment');
const puppeteer = require('puppeteer')

async function printPDF(path) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(path, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
}

router.get('/pdf', async function (req, res) {
    const prevPage = req.headers.referer;
    const pdf = printPDF(prevPage);
    res.render(prevPage);
    res.send(pdf);
})

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

    //get data from database
    let [category, tag, img_cap, listComment] = await Promise.all([
        modelCategory.singleCatByIDCat2(post.category),
        modelTagPost.singleByPost(id),
        modelImageCaption.singleByFolder(post.folder_img),
        modelComment.loadByPost(post.id)
    ]);

    //category
    post.category = category[0];

    // tag
    for (let i = 0; i < tag.length; i++) {
        tag[i] = { 'tag': tag[i] };
    }

    // image_caption
    // post = convertContent(post, img_cap);

    // comment
    listComment.sort(function (a, b) {
        moment.locale('vi');
        return moment(b.publish_date).diff(moment(a.publish_date), 'days');
    })
    post['listComment'] = listComment;

    // add list tag into post
    post['listTag'] = tag;

    res.render('viewPost/_post.hbs', {
        post,
        relPost,
    });
});

module.exports = router;