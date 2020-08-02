const express = require('express');
const router = express.Router();
const cateModel = require('../models/category.model');
const { options } = require('./home.route');
const tagModel = require('../models/tag.model');
const config = require('../db/config/config.json');
const tagPostModel = require('../models/tag-post.model');
const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
// router.use(function (req, res, next) {
//     req.app.set('view options', { layout: 'admin.hbs' });
//     next();
// })
//                  DEFAULT VIEW ADMIN
router.get('/', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        res.render('layouts/admin.hbs', { layout: false });
    }
});
//                                          ADMIN CATEGORY 
router.get('/category', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const categoryLv1 = await cateModel.loadCat1();
        res.render('viewAdmin/viewCategory/listCategory.hbs',
            {
                layout: false,
                categories1: categoryLv1,
                empty: categoryLv1.length === 0
            });
    }
});

router.get('/category/add', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    } else {
        res.render('viewAdmin/viewCategory/add.hbs', {
            layout: false
        });
    }
});

router.post('/category/add', async function (req, res) {
    await cateModel.add1(req.body);
    res.render('viewAdmin/viewCategory/add.hbs', {
        layout: false
    });
});

router.get('/category/edit/:catID', async function (req, res) {
    // const id = +req.query.id || -1;
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.catID || -1;
        const rows = await cateModel.single1(id);
        if (rows.length === 0)
            return res.send('Invalid parameter.');

        const category = rows[0];
        res.render('viewAdmin/viewCategory/edit.hbs', { layout: false, category });
    }
});

router.post('/category/del', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        delete: 1
    }
    await cateModel.patch1(entity);
    await cateModel.deteleAllbyCatLv2(req.body.id);
    res.redirect('/admin/category');
});

router.post('/category/update', async function (req, res) {
    await cateModel.patch1(req.body);
    res.redirect('/admin/category');
});
router.post('/category/restore', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        delete: 0
    }
    await cateModel.patch1(entity);
    res.redirect('/admin/category');
});
//                                  CATEGORY LEVEL2
router.get('/category/detail/:catID', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.catID || -1;
        const categoryLv2 = await cateModel.single2(req.params.catID);
        res.render('viewAdmin/viewCategory/detail.hbs', {
            layout: false,
            category: categoryLv2,
            cat1ID: id,
            empty: categoryLv2.length === 0
        });
    }
});
router.get('/categorylv2/add/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const cat1 = await cateModel.single1(id);
        res.render('viewAdmin/viewCategory/addLv2.hbs', { layout: false, catLv1: cat1[0] });
    }
});
router.post('/categorylv2/add', async function (req, res) {
    await cateModel.add2(req.body);
    res.redirect(req.headers.referer);
});
router.get('/categorylv2/edit/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const rows = await cateModel.singleCat2ByID(id);
        if (rows.length === 0)
            return res.send('Invalid parameter.');

        const category = rows[0];
        const cat1 = await cateModel.loadCat1();
        let i = 0;
        while (i < cat1.length) {
            if (category.category_level1 === cat1[i].id) {
                cat1[i].isActive = true;
            }
            i++;
        }
        res.render('viewAdmin/viewCategory/editLv2.hbs', { layout: false, category, catLv1: cat1 });
    }
});
router.post('/categorylv2/update', async function (req, res) {
    await cateModel.patch2(req.body);
    //   const url = req.query.retUrl || '/';
    //  res.redirect(url);
    res.redirect(req.headers.referer);
});
router.post('/categorylv2/restore', async function (req, res) {
    cat1 = await cateModel.singleCat1ByCat2ID(req.body.id);
    if (cat1 === null) {
        return res.send("Category lv1 is locked");
    }
    else {
        var entity = {
            id: req.body.id,
            name: req.body.name,
            delete: 0
        }
        await cateModel.patch2(entity);
    }
    res.redirect(req.headers.referer);
});
router.post('/categorylv2/del', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        delete: 1
    }
    await cateModel.patch2(entity);
    res.redirect(req.headers.referer);
});
//                              END ADMIN CATEGORY


//                                                ADMIN TAG
router.get('/tag', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const page = +req.query.page || 1;
        if (page < 0 || !page) {
            page = 1;
        }
        const offset = (page - 1) * config.pagination.limit;

        const [list, total] = await Promise.all([
            //config.pagination.limit
            tagModel.pageByTag(config.pagination.limit, offset),
            tagModel.countByTag()
        ]);

        // const total = await productModel.countByCat(req.params.catId);
        const nPages = Math.ceil(total / config.pagination.limit);
        const pageItems = [];

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

        res.render('viewAdmin/viewTag/list.hbs',
            {
                layout: false,
                tags: list,
                empty: list.length === 0,
                pageItems,
                prev_value: page - 1,
                next_value: page + 1,
                can_go_prev: page > 1,
                can_go_next: page < nPages
            });
    }
});
router.get('/tag/add', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        res.render('viewAdmin/viewTag/add.hbs', {
            layout: false
        });
    }
});

router.post('/tag/add', async function (req, res) {
    console.log(req.body);
    await tagModel.add(req.body);
    res.render('viewAdmin/viewTag/add.hbs', {
        layout: false
    });
});

router.get('/tag/edit/:id', async function (req, res) {
    // const id = +req.query.id || -1;
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const rows = await tagModel.singleTagById(id);
        if (rows.length === 0)
            return res.send('Invalid parameter.');

        const tag = rows[0];
        res.render('viewAdmin/viewTag/edit.hbs', { layout: false, tag });
    }
});

router.post('/tag/del', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        des: req.body.des,
        delete: 1
    }
    await tagModel.patch(entity);
    await tagModel.deteleAllTagPostByTag(req.body.id);
    res.redirect('/admin/tag');
});

router.post('/tag/update', async function (req, res) {
    await tagModel.patch(req.body);
    res.redirect('/admin/tag');
});
router.post('/tag/restore', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        des: req.body.des,
        delete: 0
    }
    await tagModel.patch(entity);
    res.redirect('/admin/tag');
});
router.get('/tag/detail/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const _tag = await tagModel.singleTagById(id);
        const tag_post = await tagPostModel.singleByTag(id);
        res.render('viewAdmin/viewTag/detail.hbs', {
            layout: false,
            tag_post,
            tag: _tag[0],
            empty: tag_post.length === 0
        });
    }
});


///                           DELETE , RESTORE, ADD TAG_POST WITH TAG
router.post('/tag_post/restore', async function (req, res) {
    var entity = {
        id: req.body.id,
        delete: 0
    }
    await tagPostModel.restore(req.body.id)
    res.redirect(req.headers.referer);
});
router.post('/tag_post/del', async function (req, res) {
    await tagPostModel.delete(req.body.id)
    const url = req.query.retUrl || '/';
    res.redirect(req.headers.referer);
});
router.get('/tag_post/add/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const _tag = await tagModel.singleTagById(id);
        const posts = await postModel.loadSortByTitle();
        req.session.prevURL = req.headers.referer
        res.render('viewAdmin/viewTag/addTagPost.hbs', { layout: false, tag: _tag[0], posts });
    }
});
router.post('/tag_post/add', async function (req, res) {
    await tagPostModel.add(req.body);
    res.redirect(req.session.prevURL);
});
/// END OF ADMIN TAG / TAG_POST

//                                      ADMIN POST

router.get('/post', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const page = +req.query.page || 1;
        if (page < 0 || !page) {
            page = 1;
        }
        const offset = (page - 1) * config.pagination.limit;

        const [list, total] = await Promise.all([
            //config.pagination.limit
            postModel.pageByPost(config.pagination.limit, offset),
            postModel.countByPost()
        ]);
        const nPages = Math.ceil(total / config.pagination.limit);
        const pageItems = [];

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

        res.render('viewAdmin/viewPost/list.hbs',
            {
                layout: false,
                posts: list,
                empty: list.length === 0,
                pageItems,
                prev_value: page - 1,
                next_value: page + 1,
                can_go_prev: page > 1,
                can_go_next: page < nPages
            });
    }
});
router.get('/post/detail/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const _post = await postModel.singleByID2(id);
        const listUser = await userModel.load();
        const categoryLv2 = await cateModel.load_cat2();
        let i = 0;
        while (i < listUser.length) {
            if (listUser[i].id === _post[0].author) {
                listUser[i].isAuthor = true;
                i = 0;
                break;
            }
            i++;
        }
        while(i< categoryLv2.length){
            if(categoryLv2[i].id === _post[0].category){
                categoryLv2[i].isCat2 = true;
                break;
            }
            i++;
        }
        res.render('viewAdmin/viewPost/detail.hbs', {
            layout: false,
            post: _post[0],
            users: listUser,
            cats2: categoryLv2,
            empty: _post.length === 0
        });
    }
});
router.post('/post/update', async function (req, res) {
    await postModel.patch(req.body);
    // if (parseInt(req.body.delete, 10) === 1) {
    //     await postModel.deleteAllTagPostByPost(req.body.id);
    // }
    res.redirect(req.headers.referer);
});
router.get('/post/tag_post/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const tag_post = await tagPostModel.postInTagPost(id);
        const _post = await postModel.singlePostById(id);
        res.render('viewAdmin/viewPost/tagToPost.hbs', {
            layout: false,
            empty: tag_post.length === 0,
            tag_posts: tag_post,
            post: _post[0]
        });
    }
});
router.get('/post_tag/add/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const _post = await postModel.singlePostById(id);
        const tags = await tagModel.All();
        req.session.prevURL = req.headers.referer;
        res.render('viewAdmin/viewPost/addTagPost.hbs', { layout: false, post: _post[0], tags });
    }
});
/*router.get('/post/add', function (req, res) {
    res.render('viewAdmin/viewPost/add.hbs', {
        layout: false
    });
});

router.post('/post/add', async function (req, res) {
    console.log(req.body);
    await tagModel.add(req.body);
    res.render('viewAdmin/viewPost/add.hbs', {
        layout: false
    });
}); */
//                              END OF POST

//                          ADMIN USER

router.get('/user', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const listUser = await userModel.All();
        res.render('viewAdmin/viewUser/list.hbs',
            {
                layout: false,
                users: listUser,
                empty: listUser.length === 0
            });
    }
});

router.get('/user/add', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        res.render('viewAdmin/viewUser/add.hbs', {
            layout: false
        });
    }
});

router.post('/user/add', async function (req, res) {
    await cateModel.add1(req.body);
    res.render('viewAdmin/viewCategory/add.hbs', {
        layout: false
    });
});

router.get('/user/detail/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const rows = await userModel.singleByID2(id);
        if (rows.length === 0)
            return res.send('Invalid parameter.');

        const user = rows[0];
        res.render('viewAdmin/viewUser/detail.hbs', { layout: false, user });
    }
});
module.exports = router;