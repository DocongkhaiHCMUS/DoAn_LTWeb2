const express = require('express');
const router = express.Router();
const cateModel = require('../models/category.model');
const moment = require('moment');
const categoryModel = require('../models/category.model');


router.get('/', function (req, res) {
    res.render('layouts/admin.hbs', { layout: false });
});
//Xu li Category
router.get('/category', async function (req, res) {
    const categoryLv1 = await cateModel.loadCat1();
    let i = 0;
    // convert datetime mysql to format DD/MM/YYYY with moment
    while (i < categoryLv1.length) {
        categoryLv1[i].create_date = moment(categoryLv1[i].create_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
        categoryLv1[i].modifile_date = moment(categoryLv1[i].modifile_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
        i++;
    }
    res.render('viewAdmin/viewCategory/listCategory.hbs',
        {
            layout: false,
            categories1: categoryLv1,
            empty: categoryLv1.length === 0
        });
});

router.get('/category/add', function (req, res) {
    res.render('viewAdmin/viewCategory/add.hbs', {
        layout: false
    });
});

router.post('/category/add', async function (req, res) {
    await cateModel.add1(req.body);
    res.render('viewAdmin/viewCategory/add.hbs', {
        layout: false
    });
});

router.get('/category/edit/:catID', async function (req, res) {
    // const id = +req.query.id || -1;
    const id = +req.params.catID || -1;
    const rows = await cateModel.single1(id);
    if (rows.length === 0)
        return res.send('Invalid parameter.');

    const category = rows[0];
    res.render('viewAdmin/viewCategory/edit.hbs', { layout: false, category });
});

router.post('/category/del', async function (req, res) {
    var entity = {
        id: req.body.id,
        name: req.body.name,
        delete: 1
    }
    await cateModel.patch1(entity);
    res.redirect('/admin/category');
});

router.post('/category/update', async function (req, res) {
    await cateModel.patch1(req.body);
    res.redirect('/admin/category');
});

router.get('/category/detail/:catID', async function (req, res) {
    const categoryLv2 = await cateModel.single2(req.params.catID);
    let i = 0 ;
    while (i < categoryLv2.length) {
        categoryLv2[i].create_date = moment(categoryLv2[i].create_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
        categoryLv2[i].modifile_date = moment(categoryLv2[i].modifile_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss');
        i++;
    }
    
    res.render('viewAdmin/viewCategory/detail.hbs', {
        layout: false,
        category: categoryLv2,
        empty: categoryLv2.length === 0
    });
});

//Xu li POST
module.exports = router;