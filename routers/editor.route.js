const express = require('express');
const router = express.Router();
const modelPost = require('../models/post.model');
const config = require('../db/config/config.json');
const moment = require('moment');

limit = config.pagination.limit;

router.get('/', async function (req, res) {
    const list  = await modelPost.postTag();
    res.render('viewEditor/editor', {
        editor: list,
        empty: list.length === 0
    });  
})

router.get('/publish/:id', async function (req, res) { 
    // const id = +req.query.id || -1; // plus: parse int
     const id = +req.params.id || -1;
     const rows = await modelPost.singleByID(id);
     if(rows.length === 0)
         return res.send ('Invalid parameter.');
     const editor = rows[0];    
     res.render('viewEditor/publish', {editor}); 
})
router.post('/update', async function (req, res) {
    await modelPost.patch(req.body);
    res.redirect('/editor');
})

router.get('/decline/:id', async function (req, res) { 
    // const id = +req.query.id || -1; // plus: parse int
     const id = +req.params.id || -1;
     const rows = await modelPost.singleByID(id);
     if(rows.length === 0)
         return res.send ('Invalid parameter.');
     const editor = rows[0];    
     res.render('viewEditor/decline', {editor}); 
 })
// router.post('/update', async function (req, res) {
//     await modelPost.patch(req.body);
//     res.redirect('/admin/categories');
// })

module.exports = router;