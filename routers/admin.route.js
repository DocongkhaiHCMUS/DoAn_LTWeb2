const express = require('express');
const router = express.Router();
const cateModel = require('../models/category.model');
const tagModel = require('../models/tag.model');
const config = require('../db/config/config.json');
const tagPostModel = require('../models/tag-post.model');
const postModel = require('../models/post.model');
const userModel = require('../models/user.model');
const perModel = require('../models/permission.model');
const AssignModel = require('../models/assign.model');
const bcrypt = require('bcrypt');
const moment = require('moment');
const assignModel = require('../models/assign.model');

//set layout for admin
router.all('/*', function (req, res, next) {
    req.app.locals.layout = 'admin.hbs';
    next();
});

router.get('/', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        res.render('viewAdmin/home_admin.hbs');
    }
});

//                                          ADMIN CATEGORY1 
router.get('/category', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const categoryLv1 = await cateModel.loadCat1();
        res.render('viewAdmin/viewCategory/listCategory.hbs',
            {
                categories1: categoryLv1,
                empty: categoryLv1.length === 0
            });
    }
});

router.get('/category/add', function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    } else {
        res.render('viewAdmin/viewCategory/add.hbs');
    }
});

router.get('/category/add/is-available', async function (req, res) {
    const cat = await cateModel.singleCat1ByCat1Name(req.query.category)
    if (!cat[0]) {
        return res.json(true);
    }
    return res.json(false);
})

router.post('/category/add', async function (req, res) {
    await cateModel.add1(req.body);
    res.render('viewAdmin/viewCategory/add.hbs');
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
        res.render('viewAdmin/viewCategory/edit.hbs', { category });
    }
});

router.post('/category/del', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        delete: 1
    }
    await cateModel.patch1(entity);
    await cateModel.delAllCat2byCat1(req.body.id);
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
        res.render('viewAdmin/viewCategory/addLv2.hbs', { catLv1: cat1[0] });
    }
});
router.get('/categorylv2/is-available', async function (req, res) {
    var split = req.query.category.split("?", 2);
    const cat2 = await cateModel.singleCat2ByCat1IDCat2Name(split[0], split[1])
    if (!cat2[0]) {
        return res.json(true);
    }
    return res.json(false);
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
                break;
            }
            i++;
        }
        res.render('viewAdmin/viewCategory/editLv2.hbs', { category, catLv1: cat1 });
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
    let rows = await postModel.countByIDCat2(req.body.id);
    const count = rows[0].total;
    if (parseInt(count, 10) > 0) {
        await postModel.deteleAllPostByCat2(req.body.id);
    }
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
        const offset = (page - 1) * config.pagination.limitAdmin;

        const [list, total] = await Promise.all([
            //config.pagination.limit
            tagModel.pageByTag(config.pagination.limitAdmin, offset),
            tagModel.countByTag()
        ]);

        // const total = await productModel.countByCat(req.params.catId);
        const nPages = Math.ceil(total / config.pagination.limitAdmin);
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
        res.render('viewAdmin/viewTag/add.hbs');
    }
});
router.get('/tag/add/is-available', async function (req, res) {
    const tag = await tagModel.singleTagByTagName(req.query.tag)
    if (!tag[0]) {
        return res.json(true);
    }
    return res.json(false);
})
router.post('/tag/add', async function (req, res) {
    await tagModel.add(req.body);
    res.render('viewAdmin/viewTag/add.hbs');
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
        res.render('viewAdmin/viewTag/edit.hbs', { tag });
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
        const posts = await postModel.loadSortByTitle(id);
        req.session.prevURL = req.headers.referer
        res.render('viewAdmin/viewTag/addTagPost.hbs', { tag: _tag[0], posts });
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
        const offset = (page - 1) * config.pagination.limitAdmin;

        const [list, total] = await Promise.all([
            //config.pagination.limit
            postModel.pageByPost(config.pagination.limitAdmin, offset),
            postModel.countByPost()
        ]);
        const nPages = Math.ceil(total / config.pagination.limitAdmin);
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
        if (parseInt(_post[0].status, 10) == 0) {
            _post[0].isBrowsed = true;
        }
        else if (parseInt(_post[0].status, 10) == 1) {
            _post[0].isPublished = true;
        }
        else if (parseInt(_post[0].status, 10) == 2) {
            _post[0].isRejected = true;
        }
        else {
            _post[0].isDrafted = true;
        }
        let i = 0;
        while (i < listUser.length) {
            if (listUser[i].id === _post[0].author) {
                listUser[i].isAuthor = true;
                i = 0;
                break;
            }
            i++;
        }
        while (i < categoryLv2.length) {
            if (categoryLv2[i].id === _post[0].category) {
                categoryLv2[i].isCat2 = true;
                break;
            }
            i++;
        }
        res.render('viewAdmin/viewPost/detail.hbs', {
            post: _post[0],
            users: listUser,
            cats2: categoryLv2,
            empty: _post.length === 0
        });
    }
});
router.post('/post/update', async function (req, res) {
    console.log(req.body.status);
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
        res.render('viewAdmin/viewPost/addTagPost.hbs', { post: _post[0], tags });
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
        let i = 0;
        while (i < listUser.length) {
            if (parseInt(listUser[i].permission, 10) === 2) {
                listUser[i].isWriter = true;
            }
            else if (parseInt(listUser[i].permission, 10) === 3) {
                listUser[i].isEditor = true;
            }
            else if (parseInt(listUser[i].permission, 10) === 4) {
                listUser[i].isAdmin = true;
            }
            else {
                listUser[i].isSubscriber = true;
            }
            i++;
        }
        res.render('viewAdmin/viewUser/list.hbs',
            {
                users: listUser,
                empty: listUser.length === 0
            });
    }
});

router.get('/user/add', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const pers = await perModel.load();
        res.render('viewAdmin/viewUser/add.hbs', {
            pers
        });
    }
});

router.post('/user/add', async function (req, res) {
    //   const user = await userModel.singleByUserName(req.body.user_name);
    // const us = user[0];
    // if (us) {
    //     const pers = await perModel.load();
    //     res.render('viewAdmin/viewUser/add.hbs', {
    //         err: 'Tên tài khoản đã tồn tại.',
    //         pers
    //     });
    // }
    // else {
    const hashPass = bcrypt.hashSync(req.body.password, 10);
    let new_user = {
        user_name: req.body.user_name,
        display_name: req.body.display_name,
        password: hashPass,
        email: req.body.email,
        DOB: moment(req.body.DOB, 'YY/MM/YYYY').format('YYYY-MM-DD'),
        permission: req.body.permission,
        gender: req.body.gender,
        time_out: moment("00/00/0000", 'DD/MM/YYYY')
    }
    userModel.add(new_user);
    res.redirect('/admin/user');
    //}
});

router.get('/user/detail/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const rows = await userModel.singleByID2(id);
        if (rows.length === 0) {
            return res.send('Invalid parameter.');
        }

        const user = rows[0];
        const pers = await perModel.load();
        let i = 0;
        if (user.permission == 1) {
            user.isGuest = true;
        }
        while (i < pers.length) {
            if (user.permission === pers[i].id) {
                pers[i].Select = true;
                break;
            }
            i++;
        }
        res.render('viewAdmin/viewUser/detail.hbs', { user, pers });
    }
});
router.post('/user/update', async function (req, res) {
    await userModel.patch(req.body);
    // if (parseInt(req.body.delete, 10) === 1) {
    //     await postModel.deleteAllTagPostByPost(req.body.id);
    // }
    res.redirect(req.headers.referer);
});
router.get('/user/assign/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const rows = await assignModel.singleByUser2(id);
        const _user = await userModel.singleByID2(id);
        const count = await assignModel.countByEditor(id);
        var assigned;
        if (count > 0) {
            assigned = false;
        }
        else {
            assigned = true;
        }
        let i = 0;
        while (i < rows.length) {
            rows[i].isResote = assigned;
            i++;
        }
        console.log(assigned);
        res.render('viewAdmin/viewUser/CategoryEditor.hbs', { assign: rows, user: _user[0], assigned });
    }
});

//                          View add Assign for  Editor
router.get('/user/addAssign/:id', async function (req, res) {
    if (!req.session.isAuthenticated || parseInt(req.session.authUser.permission, 10) != 4) {
        res.redirect('/');
    }
    else {
        const id = +req.params.id || -1;
        const editor = await userModel.singleByID2(id);
        const cat1 = await cateModel.loadCat1ByAssign(id);

        req.session.prevURL = req.headers.referer;
        res.render('viewAdmin/viewUser/addAssign.hbs', { Editor: editor[0], Cat1: cat1 });
    }
});
router.post('/user/addAssign/add', async function (req, res) {
    await AssignModel.add(req.body);
    res.redirect(req.session.prevURL);
});

//                              RESTORE,DELETE  ASSIGN
router.post('/assign/restore', async function (req, res) {
    var entity = {
        id: req.body.id,
        delete: 0
    }
    await AssignModel.restore(req.body.id)
    res.redirect(req.headers.referer);
});
router.post('/assign/del', async function (req, res) {
    await AssignModel.delete(req.body.id)
    res.redirect(req.headers.referer);
});


module.exports = router;