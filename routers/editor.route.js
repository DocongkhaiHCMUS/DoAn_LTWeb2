const express = require("express");
const router = express.Router();
const modelPost = require("../models/post.model");
const modelTagPost = require("../models/tag-post.model");
const config = require("../db/config/config.json");
const moment = require("moment");

limit = config.pagination.limit;

router.get("/", async function (req, res) {
  const list = await modelPost.postTag();

  res.render("viewEditor/editor", {
    editor: list,
    empty: list.length === 0,
  });
});

router.get("/publish/:id", async function (req, res) {
  let id = +req.params.id || -1;

  //get data in db
  const rows = await modelPost.singleByID(id);
  const tag = await modelTagPost.singleByPost(id);
  //const cat = await modelPost.singleByIDCat2(id);

  // tag
  for (let i = 0; i < tag.length; i++) {
    tag[i] = { tag: tag[i] };
  }

  const post = rows[0];
  //const catName = cat[0];
  res.render("viewEditor/publish.hbs", {
    post,
    tag,
    //catName,
  });
});

router.get("/decline/:id", async function (req, res) {
  // const id = +req.query.id || -1; // plus: parse int
  const id = +req.params.id || -1;
  const rows = await modelPost.singleByID(id);
  if (rows.length === 0) return res.send("Invalid parameter.");

  const editor = rows[0];
  res.render("viewEditor/decline", { editor });
});

router.post("/update_publish", async function (req, res) {
  const id = +req.body.id || -1;

  let [list, tag] = await Promise.all([
    modelPost.singleByID(id),
    modelTagPost.singleByPost(id),
  ]);
  //Create var was be give value change
  request_ = req.body;
  req_category = req.body.category;
  req_tags = req.body.selected_tags;
  req_dateP = req.body.publish_date;

  //Process date, if values change, we will change value in db
  if (request_ != null) {
    let i,
      j = 0;
    for (i = 0; i < tag.length; i++) {
      // Check tag empty
      if (req_tags == null) {
        console.log("no data");
        if (tag[i].name != req_tags) {
          if (tag[i].name != "") {
            await modelTagPost.patch_tag(tag[i].tag);
          }
        } else {
          j++;
        }
      }
      // Check tag have 1 or much tags
      else if (req_tags.length > 3) {
        if (tag[i].name != req_tags) {
          if (tag[i].name != "") {
            await modelTagPost.patch_tag(tag[i].tag);
          }
        } else {
          j++;
        }
      } else {
        if (tag[i].name != req_tags[j]) {
          if (tag[i].name != null) {
            await modelTagPost.patch_tag(tag[i].tag);
          }
        } else {
          j++;
        }
      }
    }

    if (req_dateP != list[0].publish_date) {
      await modelTagPost.patch_post(request_);
    }
    if (req_category != list[0].category) {
      await modelTagPost.patch_post(request_);
    }
  } else {
    console.log("No values");
  }

  res.redirect("/editor");
  // await modelTagPost.undo_tag(req.body);
  // res.redirect('/editor');
});

router.post("/update_decline", async function (req, res) {
  await modelPost.patch(req.body);
  res.redirect("/editor");
});

module.exports = router;
