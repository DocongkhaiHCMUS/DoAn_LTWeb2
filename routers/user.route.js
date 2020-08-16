const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const multer  = require('multer')
const fs = require('fs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/img/img_avatar')
  },
  filename: function (req, file, cb) {
      var rd
      do {
        rd = Math.floor(Math.random() * 10000);
      } while (fs.existsSync('./public/img/img_post/'+String(rd)+'jpg'));
      cb(null, String(rd)+'.jpg')
  }
})
var upload = multer({ storage: storage })

router.get('/profile/', async function (req, res) {
    const user = await userModel.singleByID(req.session.authUser.id)
    var isMale;
    var _user = user[0];
    console.log(_user);
    if(_user.gender == 0 )
    {
      isMale = true;
    }
    else
      isMale = false;
    res.render('viewProfile/profile', {
      _user,
      isMale
    });
  }),
router.post('/profile/',upload.single('avatar'),async function (req, res) {
  const entity = {
    id : req.session.authUser.id,
    display_name : req.body.display_name,
    user_name : req.body.user_name,
    email : req.body.email,
    //DOB : req.body.dob,
    gender : Number(req.body.gender),
    avatar : req.file.filename,
    delete : 0
  }
  await userModel.patchUser(entity);
  res.redirect('/user/profile');
  }),
module.exports = router;