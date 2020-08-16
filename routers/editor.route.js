const express = require("express");
const router = express.Router();
const modelPost = require("../models/post.model");
const modelTagPost = require("../models/tag-post.model");
const modelTag = require('../models/tag.model');
const assignModel = require('../models/assign.model');
const categoryModel = require('../models/category.model');
const config = require('../db/config/config.json');
const tagModel = require("../models/tag.model");
const postModel = require("../models/post.model");
const tagPostModel = require("../models/tag-post.model");
const moment = require('moment');

router.get("/draft", async function (req, res) {

  let page = +req.query.page || -1;
  if (page <= 0 || !page)
    page = 1;
  let limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  //get data
  let assign = await assignModel.singleByUser(req.session.authUser.id);
  if (assign == undefined || assign == '' || assign == [])
    res.render("viewEditor/editor", {
      empty: true
    });
  else {
    let cat1 = assign[0].category;

    let [list, total] = await Promise.all([
      modelPost.loadPostForEditor_page(limit, offset, cat1),
      modelPost.countPostForEditor(cat1)
    ]);

    //compute total page number
    total = total[0].total;
    const nPages = Math.ceil(total / limit);
    let pageItems = [];

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

    res.render("viewEditor/editor", {
      editor: list,
      empty: list.length === 0,
      pageItems,
      prev_value: page - 1,
      next_value: page + 1,
      can_go_prev: page > 1,
      can_go_next: page < nPages
    });
  }
});

router.get("/process", async function (req, res) {

  let page = +req.query.page || -1;
  if (page <= 0 || !page)
    page = 1;
  let limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  //get data
  let assign = await assignModel.singleByUser(req.session.authUser.id);
  if (assign == undefined || assign == '' || assign == [])
    res.render("viewEditor/editor", {
      empty: true
    });
  else {
    let cat1 = assign[0].category;


    let [list, total] = await Promise.all([
      modelPost.loadPostEditByEditor_page(limit, offset, req.session.authUser.id),
      modelPost.countPostEditByEditor(cat1)
    ]);

    //compute total page number
    total = total[0].total;
    const nPages = Math.ceil(total / limit);
    let pageItems = [];

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

    list = list.map(function (item) {
      if (item.status == 1)
        item.status = "Đã xuất bản";
      else if (item.status == 0)
        item.status = "Đã duyệt và chờ xuất bản";
      else if (item.status == 2)
        item.status = "Từ chối";
      else if (item.status == 3)
        item.status = "Chưa được duyệt";
      return item;
    })

    res.render("viewEditor/editor", {
      editor: list,
      empty: list.length === 0,
      pageItems,
      process: true,
      prev_value: page - 1,
      next_value: page + 1,
      can_go_prev: page > 1,
      can_go_next: page < nPages
    });
  }
});


router.get("/detail/:id", async function (req, res) {
  let id = +req.params.id || -1;

  //get data
  let [post, list1, list2, listTagPost, listTag, assign] = await Promise.all([
    modelPost.singleByID(id),
    categoryModel.loadCat1(),
    categoryModel.loadCat2(),
    modelTagPost.singleByPost(id),
    tagModel.load(),
    assignModel.singleByUser(req.session.authUser.id)
  ]);

  //add category into post
  let catOfPost = post[0].category;
  // console.log(catOfPost);

  //get category1 of editor
  let cat1Assign = assign[0].category;

  //get listcat2 of assign
  let listCat2Assign = list2.filter(function (item) {
    return item.category_level1 === cat1Assign;
  }).map(function (item) {
    if (catOfPost == item.id) {
      item['active'] = true;
    }
    return item;
  })

  //get list tag
  let tagOfPost = listTagPost.map(function (item) {
    return item.tag;
  })
  //map list tag
  listTag = listTag.map(function (item) {
    if (tagOfPost.includes(item.id)) {
      item['active'] = true;
    }
    return item;
  })

  // //set list tag
  // post['listTag'] = tagOfPost;
  res.render('viewEditor/detail.hbs', {
    post: post[0],
    listTag,
    listCat2Assign
  });
})

router.post("/accept", async function (req, res) {
  let entity = {
    id: req.body.id,
    status: 1,
    category: req.body.category,
    publish_date: moment(req.body.publish_date, "HH:mm, DD/MM/YYYY").format("YYYY/MM/DD HH:mm:ss"),
    editor: req.session.authUser.id
  }

  console.log(entity);

  await postModel.patch(entity);

  //get data
  let listTagPost_old = await modelTagPost.singleByPost(req.body.id);
  let listIDTagPost = [...listTagPost_old];
  listTagPost_old = listTagPost_old.map(item => item.tag);
  let listTagPost_new = req.body.tag;
  listTagPost_new = listTagPost_new.map(item => parseInt(item));

  //filter difference between 2 list Tag new and old
  let arrTemp = [...listTagPost_old]
  listTagPost_old = listTagPost_old.filter(function (item) {
    return listTagPost_new.indexOf(item) == -1;
  })
  listTagPost_new = listTagPost_new.filter(function (item) {
    return arrTemp.indexOf(item) == -1;
  })

  // console.log('old 2 : ' + listTagPost_old);
  // console.log('new 2: ' + listTagPost_new);

  //delete old tag_post
  for (let item of listTagPost_old) {
    let tpID = listIDTagPost.filter(function (item1) {
      return item1.tag == item;
    })
    // console.log('delete' + item);
    await tagPostModel.delete(tpID[0].id);
  }

  //insert new tag
  for (let item of listTagPost_new) {
    let rs = await modelTagPost.singleByTagPost(item, req.body.id);
    if (!rs || rs === undefined || rs.length <= 0) {
      let tpadd = {
        tag: item,
        post: req.body.id
      }
      await tagPostModel.add(tpadd);
    }
    else {
      await tagPostModel.restore(rs[0].id);
    }
  }

  res.redirect("/editor");
})

router.post("/deny", async function (req, res) {
  const entity = {
    id: req.body.id,
    status: 2,
    reason: req.body.reason,
    editor: req.session.authUser.id
  }
  console.log(entity);
  await modelPost.patch(entity);
  res.redirect("/editor");
});

module.exports = router;
