const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
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
router.post('/profile/',async function (req, res) {
  const entity = {
    id : req.session.authUser.id,
    display_name : req.body.display_name,
    user_name : req.body.user_name,
    email : req.body.email,
    //DOB : req.body.dob,
    gender : Number(req.body.gender),
    delete : 0
  }
  await userModel.patch(entity);
  res.redirect('/user/profile');
  }),
module.exports = router;