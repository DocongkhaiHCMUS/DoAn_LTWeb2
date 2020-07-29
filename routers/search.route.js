const express = require('express');
const router = express.Router();
const modelPost = require('../models/post.model');
const config = require('../db/config/config.json');
const moment = require('moment');

//filter list tag for post
function addTag(item, listTag) {
    let list = listTag.filter(function (item1) {
        return item1.post == item.id;
    })
    item['listTag'] = list;
    return item;
}

// add category level1 and level2 into post
function convertCat(item, list2, list1) {
    let cat1, cat2;
    try {
        cat2 = list2[item.category - 1];
        cat1 = list1[cat2.category_level1 - 1];
        if (cat1 && cat2)
            item.category = {
                'id_cat1': cat1.id,
                'nameCat1': cat1.name,
                'id_cat2': cat2.id,
                'nameCat2': cat2.name
            }
    } catch (error) {
    }
    finally {
        return item;
    }
}

router.get('/', async function (req, res) {

    // get id cat1 and page number
    //compute offset data row of page number
    let text = req.query.txtSearch || "";
    let page = +req.query.page || 1;
    if (page <= 0 || !page)
        page = 1;

    limit = config.pagination.limit;
    let offset = (page - 1) * limit;

    //get data in db
    let [listPost, total_post] = await Promise.all([
        modelPost.searchText(text, limit, offset),
        modelPost.countSearchText(text)
    ]);

    let total = total_post[0].total;

    //get list category locals
    let list1 = req.app.locals.list1;
    let list2 = req.app.locals.list2;

    //get list Tag locals
    let listTag = req.app.locals.listTag;

    //compute total page number
    let nPages = Math.ceil(total / limit);
    let pageItems = [];

    if (1 == page)
        pageItems.push({
            'text': text,
            'value': 1,
            'active': true
        });
    else
        pageItems.push({
            'text': text,
            'value': 1
        });

    if (page - 3 > 2) {
        pageItems.push({
            'value': '...',
            'disable': true
        });
    }

    if (nPages > 1) {
        let top = (page + 3 < nPages - 1 ? page + 3 : nPages - 1);
        let bot = (page - 3 > 1 ? page - 3 : 2);
        for (let i = bot; i <= top; i++) {
            if (i == page)
                pageItems.push({
                    'text': text,
                    'value': i,
                    'active': true
                });
            else
                pageItems.push({ 'text': text, 'value': i });
        }
    }

    if (page + 3 < nPages - 1) {
        pageItems.push({
            'value': '...',
            'disable': true
        });
    }

    if (nPages == page && nPages != 1)
        pageItems.push({
            'text': text,
            'value': nPages,
            'active': true
        });
    else if (nPages > 1)
        pageItems.push({
            'text': text,
            'value': nPages
        });

    //add listTag for each post in list post
    listPost.map(function (item) {
        return addTag(item, listTag);
    })

    // add category to post
    listPost.map(function (item1) {
        return convertCat(item1, list2, list1);
    })

    //filter all post has publish date before current time
    listPost = listPost.filter(function (item) {
        moment.locale('vi');
        return moment(item.publish_date).diff(moment(), 'seconds') <= 0;
    })

    res.render('viewSearch/search.hbs', {
        listPost,
        text,
        pageItems,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages
    })
})

module.exports = router;
