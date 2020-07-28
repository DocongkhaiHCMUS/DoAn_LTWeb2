const modelCategory = require('../models/category.model');
const modelPost = require('../models/post.model');
const modelTagPost = require('../models/tag-post.model');
const moment = require('moment');
const nodeCache = require('node-cache');

const Cache = new nodeCache();

// split all category level 1 push into a list
function convertToCat1(list, getID = false) {
    let cat1_temp = [];
    let cat1_tempID = [];
    let cat1 = [];
    if (getID == false) {
        for (let item of list) {

            // if cat1 doesn't contains item then push item
            if (cat1_temp.includes(item['cat1']) == false) {
                cat1_temp.push(item['cat1']);
                cat1_tempID.push(item['id_cat1']);
            }
        }
        for (let i = 0; i < cat1_temp.length; i++) {
            cat1.push({
                'id_cat1': cat1_tempID[i],
                'nameCat1': cat1_temp[i]
            });
        }
    }
    else {
        for (let item of list) {

            // if cat1 doesn't contains item then push item
            if (cat1_temp.includes(item['id_cat1']) == false)
                cat1_temp.push(item['id_cat1']);
        }
        for (let item of cat1_temp) {
            cat1.push({ 'id_Cat1': item });
        }
    }
    return cat1;
}

//split all category level 2 follow each category level 1 and push into list object 
function convertToCatFull(list, cat1, getID = false) {
    let temp = [];
    let old_cat1;
    let i = 0;
    if (getID == false) {
        for (let item of list) {

            // if end of category level 1 , push list category level 2 into object category level 1 and start next
            if (old_cat1 != item['cat1'] && temp.length != 0) {
                cat1[i]['list'] = temp;
                old_cat1 = item['cat1'];
                i++;
                temp = [];
                temp.push({
                    'id_cat2': item['id_cat2'],
                    "nameCat2": item['cat2']
                });
            }
            else {
                temp.push({
                    'id_cat2': item['id_cat2'],
                    "nameCat2": item['cat2']
                });
                old_cat1 = item['cat1'];
            }
        }
        cat1[i]['list'] = temp;
    }
    else {
        for (let item of list) {

            // if end of category level 1 , push list category level 2 into object category level 1 and start next
            if (old_cat1 != item['id_cat1'] && temp.length != 0) {
                cat1[i]['list'] = temp;
                old_cat1 = item['id_cat1'];
                i++;
                temp = [];
                temp.push(item['id_cat2']);
            }
            else {
                temp.push(item['id_cat2']);
                old_cat1 = item['id_cat1'];
            }
        }
        cat1[i]['list'] = temp;
    }
    return cat1;
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

module.exports = function (app) {
    app.use(async function (req, res, next) {

        //check if list Category, list Tag, list Post exists in cache
        // if not exixts then get data from database and push to cahe
        if (!Cache.has('listCat') || !Cache.has('list1') || !Cache.has('list2') ||
            !Cache.has('listTag') || !Cache.has('listPost')) {

            //local categories
            let [listCategory, list1, list2, listTag, listPost] = await Promise.all([
                modelCategory.load(),
                modelCategory.load_cat1(),
                modelCategory.load_cat2(),
                modelTagPost.load(),
                modelPost.load()
            ]);

            //filter all post has publish date before current time
            listPost = listPost.filter(function (item) {
                moment.locale('vi');
                return moment(item.publish_date).diff(moment(), 'seconds') <= 0;
            })

            Cache.set('listCategory', listCategory);
            Cache.set('list1', list1);
            Cache.set('list2', list2);
            Cache.set('listTag', listTag);
            Cache.set('listPost', listPost);

            //local categories menu
            let listCat1 = convertToCat1(listCategory);
            let listCat = convertToCatFull(listCategory, listCat1);
            Cache.set('listCat', listCat);
        }
        //get list Category, list Tag, list Post from cache
        app.locals.listCat = Cache.get('listCat');
        app.locals.list1 = Cache.get('list1');
        app.locals.list2 = Cache.get('list2');
        app.locals.listTag = Cache.get('listTag');
        app.locals.listPost = Cache.get('listPost');

        //check if list list Post exists in cache
        // if not exixts then get data and push to cahe
        if (!Cache.has('highlightPost') || !Cache.has('mostViewedPost') || !Cache.has('latestPost10')) {

            //list posts
            let listPost = Cache.get('listPost');
            //list cat
            let list1 = Cache.get('list1');
            let list2 = Cache.get('list2');
            let listCategory = Cache.get('listCategory');

            //local 4 highlights posts
            // highlights posts are the posts are most viewed the current way the number of days specified
            // in there number of days are 40 days
            let highlightPost = listPost.filter(function (item) {
                return moment().diff(moment(item.time), 'days') <= 40;
            })
                .sort(function (a, b) {
                    return b.views - a.views;
                })
                .slice(0, 4);

            highlightPost.map(function (item) {
                return convertCat(item, list2, list1);
            })

            Cache.set('highlightPost', highlightPost);

            //local 10 latest post and most viewed post each category
            let listIDCat1 = convertToCat1(listCategory, true);
            app.locals.listIDCat = convertToCatFull(listCategory, listIDCat1, true);

            let latestPost = [];
            let latestPost10 = [];
            let mostViewedPost = [];
            for (var item of list1) {

                let listPostTemp = listPost.filter(function (item1) {
                    let rs;
                    try {
                        if (item.id < 8)
                            rs = listIDCat1[item.id - 1].list.includes(item1.category);
                        else if (item.id == 8)
                            rs = listIDCat1[14].list.includes(item1.category);
                        else if (item.id > 8)
                            rs = listIDCat1[item.id - 2].list.includes(item1.category);
                    } catch (error) {
                        console.log(errer);
                    }
                    finally {
                        return rs;
                    }
                })
                    .sort(function (a, b) {
                        moment.locale('vi');

                        return moment(b.publish_date).diff(moment(a.publish_date), 'days');
                    })
                    .slice(0, 10);

                latestPost.push({
                    'id': item.id,
                    'category': item.name,
                    'listPost': listPostTemp
                });

                let listPostTemp10 = listPostTemp.slice(0, 1);
                if (item.id <= 10)
                    latestPost10.push({
                        'id': item.id,
                        'category': item.name,
                        'listPost': listPostTemp10
                    });

                let listPostTemp1 = listPost.filter(function (item1) {
                    let rs;
                    if (item.id < 8)
                        rs = listIDCat1[item.id - 1].list.includes(item1.category);
                    else if (item.id == 8)
                        rs = listIDCat1[14].list.includes(item1.category);
                    else if (item.id > 8)
                        rs = listIDCat1[item.id - 2].list.includes(item1.category);
                    return rs;
                })
                    .sort(function (a, b) {
                        return b.views - a.views;
                    })
                    .slice(0, 10);

                mostViewedPost.push({
                    'id': item.id,
                    'category': item.name,
                    'listMostViewedPost': listPostTemp1
                })
            }

            mostViewedPost.map(function (item) {
                try {
                    if (item.id < 8)
                        item['listCat2'] = app.locals.listCat[item.id - 1].list;
                    else if (item.id == 8)
                        item['listCat2'] = app.locals.listCat[14].list;
                    else if (item.id > 8)
                        item['listCat2'] = app.locals.listCat[item.id - 2].list;
                    item['listLatestPost'] = latestPost[item.id - 1].listPost;
                }
                catch (err) {
                    console.log(err);
                }
                finally {
                    return item;
                }
            });

            for (let i = 0; i < mostViewedPost.length; i++) {
                mostViewedPost[i].listLatestPost.map(function (item1) {
                    return convertCat(item1, list2, list1);
                });
                mostViewedPost[i].listMostViewedPost.map(function (item1) {
                    return convertCat(item1, list2, list1);
                });
            }
            Cache.set('mostViewedPost', mostViewedPost);

            //local 10 latest post
            for (let i = 0; i < latestPost10.length; i++) {
                latestPost10[i].listPost.map(function (item1) {
                    return convertCat(item1, list2, list1);
                })
            }
            Cache.set('latestPost10', latestPost10);
        }
        //get list Post from cache
        app.locals.highlightPost = Cache.get('highlightPost');
        app.locals.latestPost10 = Cache.get('latestPost10');
        app.locals.mostViewedPost = Cache.get('mostViewedPost');

        //local Authentication
        if (req.session.isAuthenticated && req.session.authUser) {
            res.locals.lcIsAuthenticated = req.session.isAuthenticated;
            res.locals.lcUser = req.session.authUser;
        }
        next();
    });
};
