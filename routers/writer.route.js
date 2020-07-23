const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');


//get post editor
router.get('/editor', function (req, res) {
    res.render('viewWriter/editorPost',{
      layout: false,
    });
})
router.post('/editor', async function (req, res) {
  const entity = {
    title : req.body.title,
    avatar :"dont have",
    tiny_des : req.body.tiny_des,
    full_des : req.body.full_des,
    author :1,
    premium : 1 ,
    status :1

  }
  await postModel.add(entity)
  //console.log(req.body.title);
  res.send('ok');
  })
  //


  //get listpost by author
  router.get('/listpost/:author', async function (req, res) {
    const list = await postModel.selectPostByAuthor(req.params.author)
    res.render('viewWriter/listPost', {
      post: list,
      empty: list.length === 0,
      layout: false,
    });
  })
  //

  //get modifiedpost by id and update
  router.get('/modifiedpost/:id', async function (req, res) {
    const post = await postModel.selectPostByID(req.params.id)
    const  _post= post[0]
    res.render('viewWriter/modifiedPost', {
      _post,
      layout: false,
    });
  })
  router.post('/update', async function (req, res) {
    //await postModel.patch(req.body);
    console.log(req.body.full_des);
    res.send('ok');

  })
  
  //
  

module.exports = router;