const modelCategory = require('../models/category.model');
const modelPost = require('../models/post.model');
const moment = require('moment');

// split all category level 1 push into a list
function convertToCat1(list, getID = false) {
    let cat1_temp = [];
    let cat1 = [];
    if (getID == false) {
        for (let item of list) {

            // if cat1 doesn't contains item then push item
            if (cat1_temp.includes(item['cat1']) == false)
                cat1_temp.push(item['cat1']);
        }
        for (let item of cat1_temp) {
            cat1.push({
                'id_cat1': item['id_cat1'],
                'nameCat1': item
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
                    'id_cat1': item['id_cat1'],
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

module.exports = function (app) {
    app.use(async function (req, res, next) {

        const listCategory = await modelCategory.load();

        //local categories menu
        let listCat1 = convertToCat1(listCategory);
        app.locals.listCat = convertToCatFull(listCategory, listCat1);

        //local categories
        const list1 = await modelCategory.load_cat1();
        const list2 = await modelCategory.load_cat2();

        //local posts
        let listPost = await modelPost.load();
        moment.locale('vi');
        listPost.map(function (item) {
            delete item.create_date;
            delete item.modifile_date;
            item.publish_date = moment(item.publish_date).format('HH:mm, DD/MM/YYYY');
            return item;
        });
        app.locals.listPost = listPost;

        //local 4 highlights post
        let highlightPost = listPost.filter(function (item) {
            return moment().diff(moment(item.time), 'days') <= 40;
        })
            .sort(function (a, b) {
                return b.views - a.views;
            })
            .slice(0, 4);
        app.locals.highlightPost = highlightPost;

        //local 10 latest post and most viewed post each category
        let listIDCat1 = convertToCat1(listCategory, true);
        app.locals.listIDCat = convertToCatFull(listCategory, listIDCat1, true);

        let latestPost = [];
        let latestPost10 = [];
        let mostViewedPost = [];
        for (var item of list1) {
            let listPostTemp = listPost.filter(function (item1) {
                return listIDCat1[item.id - 1].list.includes(item1.category);
            })
                .sort(function (a, b) {
                    moment.locale('vi');

                    return moment(b.publish_date, 'HH:mm, DD/MM/YYYY').diff(moment(a.publish_date, 'HH:mm, DD/MM/YYYY'), 'days');
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
                return listIDCat1[item.id - 1].list.includes(item1.category);
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
        // app.locals.latestPost = latestPost;

        mostViewedPost.map(function (item) {
            item['listCat2'] = app.locals.listCat[item.id - 1].list;
            item['listLatestPost'] = latestPost[item.id - 1].listPost;
            return item;
        });

        app.locals.mostViewedPost = mostViewedPost;

        //local 10 latest post
        app.locals.latestPost10 = latestPost10;

        //local Authentication
        if (req.session.isAuthenticated && req.session.authUser) {
            res.locals.lcIsAuthenticated = req.session.isAuthenticated;
            res.locals.lcUser = req.session.authUser;
        }
        next();
    });
};
