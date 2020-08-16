const express = require('express');
const router = express.Router();
const postModel = require('../models/post.model');
const fs = require('fs');
const fse = require('fs-extra');
const multer  = require('multer')
const path = require("path");
const modelImageCaption = require('../models/img-caption.route');

//////////upload image editor//////////
  var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        if(req.app.locals.folderImgEditor !=null)
        {
          cb(null, './public/img/img_post/'+req.app.locals.folderImgEditor+'/');
        }else
          cb(null, './public/img/img_post/'+req.app.locals.folderImgModified+'/');
      },
      filename: function (req, file, cb) {
        if(req.app.locals.folderImgEditor !=null)
        {
          var n;
          do {
            a = Math.floor(Math.random() * 10000);
            b = "f__"+String(req.app.locals.rd)+'_img_'+String(a)+'.jpg';
          } while (fs.existsSync('./public/img/img_post/'+b));
          cb(null, b)
        }
        else
        {
          var n;
          do {
            a = Math.floor(Math.random() * 10000);
            b = "f__"+String(req.app.locals.numberOfFolder)+'_img_'+String(a)+'.jpg';
          } while (fs.existsSync('./public/img/img_post/'+b));
          cb(null, b)
        }
      }
  })
  var upload = multer({ storage: storage })


////////handle add, delete image editor////////
router.get('/files',async function (req, res) {
  if(req.app.locals.folderImgEditor !=null)
  {
    var images = fs.readdirSync('public/img/img_post/'+req.app.locals.folderImgEditor)
  }
  else
  {
    var images = fs.readdirSync('public/img/img_post/'+req.app.locals.folderImgModified)
  }
  var sorted = []
  for (let item of images){
      if(item.split('.').pop() === 'png'
      || item.split('.').pop() === 'jpg'
      || item.split('.').pop() === 'jpeg'
      || item.split('.').pop() === 'svg'){
          if(req.app.locals.folderImgEditor != null)
          {
            var abc = {
              "image" : "/public/img/img_post/"+req.app.locals.folderImgEditor+"/"+item,
              "folder" : '/'
            }
            sorted.push(abc)
          }
          else
          {
            var abc = {
              "image" : "/public/img/img_post/"+req.app.locals.folderImgModified+"/"+item,
              "folder" : '/'
            }
            sorted.push(abc)
          }
      }
  }
  res.send(sorted);
}),
router.post('/upload', upload.array('flFileUpload', 21), function (req, res, next) {
  res.redirect('back')
});
router.post('/delete_file', function(req, res, next){
var url_del = (req.body.url_del).substr(1)
console.log(url_del)
if(fs.existsSync(url_del)){
  fs.unlinkSync(url_del)
}
res.redirect('back')
});


//////////upload avatar//////////
var storageAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    //fs.mkdirSync(path.join('./public/img/img_post/', f));
    if(req.app.locals.folderImgEditor != null)
    {
      cb(null, './public/img/img_post/'+req.app.locals.folderImgEditor)
    }
    else
    {
      cb(null, './public/img/img_post/'+req.app.locals.folderImgModified)
    }

  },
  filename: function (req, file, cb) {
    if(req.app.locals.folderImgEditor != null)
    { 
      cb(null, 'f__'+String(req.app.locals.rd)+'_avatar.jpg')
    }
    else
    {
      cb(null, 'f__'+String(req.app.locals.numberOfFolder)+'_avatar.jpg')
    }
  }
})
var uploadAvatar = multer({ storage: storageAvatar })

//////////get, post editor//////////
router.get('/editor',async function (req, res) {
  ////////random, create folder////////
  if(req.app.locals.folderImgEditor != null)
  {
    fse.remove('./public/img/img_post/'+req.app.locals.folderImgEditor)
  }
    var f 
    var rd
    do {
      rd = Math.floor(Math.random() * 10000);
      f = "folder_image__"+String(rd);
    } while (fs.existsSync('./public/img/img_post/'+f));
    console.log(f);
    req.app.locals.folderImgEditor = f
    req.app.locals.rd = rd
    fs.mkdirSync(path.join("./public/img/img_post",req.app.locals.folderImgEditor));
    req.app.locals.folderImgModified = null  
    const list = await postModel.selectNameCat1Cat2()
    const tag = await postModel.selectTag()

    res.render('viewWriter/test1',{
      list: list,
      tag: tag,
      result: 'result'
    });
}),
router.post('/editor' ,uploadAvatar.single('avatar'),async function (req, res) {
  //////////add post//////////
  var fileName = (req.file.filename).split('.');//bỏ đuôi jpg

  const entity1 = {
    title : req.body.title,
    avatar : fileName[0],
    folder_img: req.app.locals.folderImgEditor,
    tiny_des : req.body.tiny_des,
    full_des : req.body.full_des,
    author :req.session.authUser.id,
    category: req.body.category,
    premium : 0,
    status :3
  }
  await postModel.add(entity1)
//////////add tag_post//////////
  const maxIDPost = await postModel.selectMaxIDPost();
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
    console.log(listTag[i]);
  }
  console.log(listTag);
  res.redirect('/writer/listpost');
})


//////////get lispost by author//////////
router.get('/listpost/', async function (req, res) {
    const list = await postModel.selectByAuthor(req.session.authUser.id)

    res.render('viewWriter/listPost', {
      list: list,
      empty: list.length === 0
    });
  }),
router.get('/listpost/:status', async function (req, res) {
    const list = await postModel.selectByAuthorByStatus(req.session.authUser.id, req.params.status)

    res.render('viewWriter/listPost', {
      list: list,
      empty: list.length === 0
    });
}),


  
//////////get modifiedpost by id and update//////////
router.get('/modifiedpost/:id', async function (req, res) {
    var post = await postModel.selectPostByID(req.params.id)
    var  _post= post[0]
    var list1 = await postModel.selectNameCat1Cat2()
    var list2 = await postModel.selectTag_Post(req.params.id)
    var list3 = await postModel.selectTag()
    var img_cap = await modelImageCaption.singleByFolder(_post.folder_img)
    var folder = await postModel.selectFolderNameByIDPost(req.params.id)
    var listFolder =[]
    for (var item of folder) {
      listFolder.push(item.folder_img)
    }
    var split = listFolder[0].split('_');
    req.app.locals.numberOfFolder = split[3]
    req.app.locals.folderImgModified = listFolder[0]
    req.app.locals.folderImgEditor = null
    //_post = convertContent(_post, img_cap);

    res.render('viewWriter/test2', {
      _post,
      list1: list1,
      list2: list2,
      list3: list3,
      layout: false,
    });
  })
  router.post('/modifiedpost/:id', uploadAvatar.single('avatar'),async function (req, res) {
    if(req.body.avatar != null)
    {
      fse.remove('./public/img/img_post/f__'+req.app.locals.numberOfFolder+'avatar.ipg')
    }
  //////////patch post//////////
    const entity1 = {
      id : req.params.id,
      title : req.body.title,
      tiny_des : req.body.tiny_des,
      full_des : req.body.full_des,
      category: Number(req.body.category),
      status :3
    }
    await postModel.patchPost(entity1);

    //////////patch tag_post//////////
    var listTagModified = req.body.tag
    console.log(listTagModified);
    console.log(listTagModified.length);
    var list = await postModel.selectAllTagByPost(req.params.id);
    var listTag = []
    for (var item of list) {
      listTag.push(item.tag) 
    }

    if(listTag.length == listTagModified.length)//neu so luong tag bang nhau
    {
      var notModified 
      for(var i =0; i<listTagModified.length; i++)//kiem tra tag co nam trong list tag khong
      {
        notModified = listTag.includes(i)
      }
      if(notModified == false)//neu co su thay doi thi cap nhap lai tag, khong thi thoi
      {
        const entity2 = {
          post: Number(req.params.id),
          delete: 1
        }
        await postModel.patchTag_Post(entity2);
        for (var i = 0; i < listTagModified.length; i++){
          const entity3 = {
            tag: Number(listTagModified[i]),
            post: Number(req.params.id),
            delete: 0
          }
        await postModel.addTag_Post(entity3)
        }
      }
    }
    else//truong hop so luong khong bang nhau thi cap nhat lai
    {
      const entity2 = {
        post: Number(req.params.id),
        delete: 1
      }
      await postModel.patchTag_Post(entity2);
      for (var i = 0; i < listTagModified.length; i++){
        const entity3 = {
          tag: Number(listTagModified[i]),
          post: Number(req.params.id),
          delete: 0
        }
        await postModel.addTag_Post(entity3)
      }
    }

    res.redirect('/writer/listpost');
  })

 
  
module.exports = router;