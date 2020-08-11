const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const fs = require('fs');
const multer  = require('multer')
const path = require("path");

//////////
function xoa_dau(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

//////////handling multer//////////
/*var uploadImage = function(folderRoot, folder){
  var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        fs.mkdirSync(path.join("./"+folderRoot, folder));
        cb(null, "./"+folderRoot+"/"+folder);
      },
      filename: function (req, file, cb) {
        cb(null, folderRoot.split("_").slice(0,1)+"_img_1.png")
      }
  })
  var upload = multer({ storage: storage }).single('avatar')
  return upload
}*/



//////////get, post editor//////////
router.get('/editor',async function (req, res) {
    const list = await postModel.selectNameCat1Cat2()
    const tag = await postModel.selectTag()
    res.render('viewWriter/editorPost',{
      layout: false,
      list: list,
      tag: tag,
    });
}),
router.post('/editor' ,async function (req, res) {
  //////////get max number of folder name//////////
  /*var maxNumberOfFolder =  await postModel.selectMaxNumberOfFolder(2)
  var listNumber = []
  for (var item of maxNumberOfFolder) {
    listNumber.push(Number(item.folder_img.split("/").slice(1,2)))  
  }
  listNumber.sort(function(a, b){return b - a});
  var folder = String(listNumber[0]+1)
  console.log(folder)

  //////////get folder name of category//////////
  var folderName =  await postModel.selectFolderName(2)
  var listName = []
  for (var item of folderName) {
    listName.push(String(item.folder_img.split("/").slice(0,1)))  
  }
  var folderRoot = listName[0]
  console.log(folderRoot)

  //////////upload img//////////
  var u = uploadImage("public/img/img_post/"+folderRoot,folder)
  u(req,res,function(err){
    
  });*/

  //////////add post//////////
  const entity1 = {
    title : req.body.title,
    avatar : "chưa có",
    folder_img: "chưa có",
    tiny_des : req.body.tiny_des,
    full_des : req.body.full_des,
    author :req.session.authUser.id,
    category: req.body.category,
    premium : 0,
    pdf: "no_pdf",
    status :3
  }
  console.log(entity1);
  await postModel.add(entity1)

  //////////add tag_post//////////
  var maxIDPost = await postModel.selectMaxIDPost();
  var arr = []
  for (var item of maxIDPost) {
    arr.push(Number(item.max))  
  }

  var listTag = req.body.tag
  for (var i = 0; i < listTag.length; i++){
    const entity2 = {
      tag: Number(listTag[i]),
      post: Number(arr[0]),
      delete: 0
    }
    await postModel.addTag_Post(entity2)
}

  res.redirect('/writer/listpost');
})



//////////get lispost by author//////////
router.get('/listpost/', async function (req, res) {
    const list = await postModel.selectByAuthor(req.session.authUser.id)
    
    res.render('viewWriter/listPost', {
      list: list,
      empty: list.length === 0,
      layout: false,
    });
  }),


  
//////////get modifiedpost by id and update//////////
router.get('/modifiedpost/:id', async function (req, res) {
    const post = await postModel.selectPostByID(req.params.id)
    const list1 = await postModel.selectNameCat1Cat2()
    const list2 = await postModel.selectTag_Post(req.params.id)
    const list3 = await postModel.selectTag()
    const  _post= post[0]

    res.render('viewWriter/modifiedPost', {
      _post,
      list1: list1,
      list2: list2,
      list3: list3,
      layout: false,
    });
  })
  router.post('/modifiedpost/:id', async function (req, res) {
  //////////patch post//////////
    const entity1 = {
      id : req.params.id,
      title : req.body.title,
      avatar : "chưa có",
      folder_img: "chưa có",
      tiny_des : req.body.tiny_des,
      full_des : req.body.full_des,
      author :req.session.authUser.id,
      category: Number(req.body.category),
      premium : 0,
      pdf: "no_pdf",
      status :3
    }
    await postModel.patch(entity1);

    //////////patch tag_post//////////
    /*const entity2 = {
      post: Number(req.params.id),
      delete: 1
    }
    await postModel.patchTag_Postost(entity2);

    var listTag = req.body.tag
    for (var i = 0; i < listTag.length; i++){
      const entity3 = {
        tag: Number(listTag[i]),
        post: Number(req.params.id),
        delete: 0
    }
      await postModel.addTag_Post(entity3)
  }*/
    
    res.redirect('/writer/listpost');
  })
  
module.exports = router;