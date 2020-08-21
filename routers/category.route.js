const express = require('express');
const router = express.Router();
const modelPost = require('../models/post.model');
const config = require('../db/config/config.json');
const moment = require('moment');

limit = config.pagination.limit;

//filter list tag for post
function addTag(item, listTag) {
    let list = listTag.filter(function (item1) {
        return item1.post === item.id;
    })
    item['listTag'] = list;
    return item;
}

router.get('/cat1/:id', async function (req, res) {
    // get id cat1 and page number
    //compute offset data row of page number
    let id = +req.params.id || -1;
    let page = +req.query.page || 1;
    if (page < 0 || !page)
        page = 1;
    let offset = (page - 1) * limit;

    //get list cat locals
    let list1 = req.app.locals.list1;
    let list2 = req.app.locals.list2;

    //get list Tag locals
    let listTag = req.app.locals.listTag;

    //filter children cat2 of cat1
    let cat1 = list1.filter(function (item) {
        return item.id == id;
    })[0];
    let cat2 = list2.filter(function (item) {
        return item.category_level1 == cat1.id;
    });

    //get data in db
    let [listPost, total] = await Promise.all([
        modelPost.singleByIDCat1_page(id, limit, offset),
        modelPost.countByIDCat1(id)
    ]);

    //compute total page number
    let nPages = Math.ceil(total[0].total / limit);
    let pageItems = [];

    if (1 == page)
        pageItems.push({
            'value': 1,
            'active': true
        });
    else
        pageItems.push({
            'value': 1,
        });

    if (page - 3 > 2) {
        pageItems.push({
            'value': '...',
            'disable': true
        });
    }

    let top = (page + 3 < nPages - 1 ? page + 3 : nPages - 1);
    let bot = (page - 3 > 1 ? page - 3 : 2);
    for (let i = bot; i <= top; i++) {
        if (i == page)
            pageItems.push({
                'value': i,
                'active': true
            });
        else
            pageItems.push({ 'value': i });
    }

    if (page + 3 < nPages - 1) {
        pageItems.push({
            'value': '...',
            'disable': true
        });
    }

    if (nPages == page && nPages != 1)
        pageItems.push({
            'value': nPages,
            'active': true
        });
    else if (nPages > 1)
        pageItems.push({
            'value': nPages
        });

    //add listTag for each post in list post
    listPost.map(function (item) {
        return addTag(item, listTag);
    })

    // //filter all post has publish date before current time
    // listPost.filter(function (item) {
    //     moment.locale('vi');
    //     return moment(item.publish_date).diff(moment(), 'seconds') >= 0;
    // })

    //sort all premium if account is subscriber
    if (req.app.locals.lcSubcriber) {
        listPost = listPost.sort(function (a, b) {
            if (b.premum && !a.premium)
                return 1;
            if (!b.premum && a.premium)
                return -1;
            return 0;
        })
    }

    res.render('viewCategory/category.hbs', {
        listPost,
        cat1,
        cat2,
        pageItems,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages
    })
})

router.get('/cat2/:id', async function (req, res) {

    // get id cat1 and page number
    //compute offset data row of page number
    let id = +req.params.id || -1;
    let page = +req.query.page || 1;
    if (page < 0 || !page)
        page = 1;
    let offset = (page - 1) * limit;

    //get list cat locals
    let list1 = req.app.locals.list1;
    let list2 = req.app.locals.list2;

    //get list Tag locals
    let listTag = req.app.locals.listTag;

    //get current cat2
    let curCat2 = list2[id - 1];

    //compute total page number
    let cat1 = list1.filter(function (item) {
        return item.id == curCat2.category_level1;
    })[0];
    
    let cat2 = list2.filter(function (item) {
        return item.category_level1 == cat1.id;
    })
    cat2.map(function (item) {
        if (item.id == curCat2.id)
            item['active'] = true;
        else
            item['active'] = false;
        return item;
    })

    //get data in db
    let [listPost, total] = await Promise.all([
        modelPost.singleByIDCat2_page(id, limit, offset),
        modelPost.countByIDCat2(id)
    ]);

    //compute total page number
    let nPages = Math.ceil(total[0].total / limit);
    let pageItems = [];

    if (1 == page)
        pageItems.push({
            'value': 1,
            'active': true
        });
    else
        pageItems.push({
            'value': 1
        });

    if (page - 3 > 1) {
        pageItems.push({
            'value': '...',
            'active': true,
            'disable': true
        });
    }

    let top = (page + 3 < nPages - 1 ? page + 3 : nPages - 1);
    let bot = (page - 3 > 1 ? page - 3 : 2);
    for (let i = bot; i <= top; i++) {
        if (i == page)
            pageItems.push({
                'value': i,
                'active': true
            });
        else
            pageItems.push({ 'value': i });
    }

    if (page + 3 < nPages - 1) {
        pageItems.push({
            'value': '...',
            'active': true,
            'disable': true
        });
    }

    if (nPages == page && nPages != 1)
        pageItems.push({
            'value': nPages,
            'active': true
        });
    else if (nPages > 1)
        pageItems.push({
            'value': nPages
        });


    //add listTag for each post in list post
    listPost.map(function (item) {
        return addTag(item, listTag);
    })

    //filter all post has publish date before current time
    listPost = listPost.filter(function (item) {
        moment.locale('vi');
        return moment(item.publish_date).diff(moment(), 'seconds') <= 0;
    })

    //sort all premium if account is subscriber
    if (req.app.locals.lcSubcriber) {
        listPost = listPost.sort(function (a, b) {
            if (b.premum && !a.premium)
                return 1;
            if (!b.premum && a.premium)
                return -1;
            return 0;
        })
    }

    res.render('viewCategory/category.hbs', {
        listPost,
        cat1,
        cat2,
        pageItems,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages
    })
})

module.exports = router;