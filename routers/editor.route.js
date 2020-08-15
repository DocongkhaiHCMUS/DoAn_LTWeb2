const express = require("express");
const router = express.Router();
const modelPost = require("../models/post.model");
const modelTagPost = require("../models/tag-post.model");

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
  const tag_all = await modelTagPost.load();

  // tag
  for (let i = 0; i < tag.length; i++) {
    tag[i] = { tag: tag[i] };
  }

  // tag_all
  for (let i = 0; i < tag_all.length; i++) {
    tag_all[i] = { tag_all: tag_all[i] };
  }

  const post = rows[0];
  //const catName = cat[0];
  res.render("viewEditor/publish.hbs", {
    post,
    tag,
    tag_all,
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
  req_tagsADD = req.body.add_tags;

  // console.log(req_tags);
  // console.log(req_tagsADD);
  //Process date, if values change, we will change value in db
  let checkTagNumber;
  if (request_ != null) {
    ////////////////////CHECK Tags

    if (req_tags == null) {
      checkTagNumber = 1;
      for (let i = 0; i < tag.length; i++) {
        if (tag[i].name != "") {
          await modelTagPost.patch_tag(tag[i].tag);
        }
      }
    } else if (Array.isArray(req_tags) == false) {
      checkTagNumber = 2;
      for (let i = 0; i < tag.length; i++) {
        if (tag[i].name != req_tags) {
          if (tag[i].name != "") {
            await modelTagPost.patch_tag(tag[i].tag);
          }
        } else {
          continue;
        }
      }
    }
    //Request Tag has tags AND Tag by Writer > more
    else if (Array.isArray(req_tags) == true) {
      checkTagNumber = 3;
      let j = 0;
      for (let i = 0; i < tag.length; i++) {
        if (tag[i].name != req_tags[j]) {
          if (tag[i].name != "") {
            await modelTagPost.patch_tag(tag[i].tag);
          }
        } else {
          j++;
        }
      }
    }

    //////////////////////////Tags added
    //WE need create array include items in Tag to add
    if (req_tagsADD == null) {
    }
    // // Case Tags added just one tag.
    else if (Array.isArray(req_tagsADD) == false) {
      let temp = false;
      let last_id = null;
      insert_Tags = {
        name: req_tagsADD,
        des: req_tagsADD,
        create_date: null,
        modifile_date: null,
        delete: 0,
      };

      if (checkTagNumber == 1) {
        //xxx
        // console.log("111111");
        last_id = await modelTagPost.add_tag(insert_Tags);
      } else if (checkTagNumber == 2) {
        if (req_tagsADD != req_tags) {
          //xxx
          // console.log("222222");
          last_id = await modelTagPost.add_tag(insert_Tags);
          //await modelTagPost.add(req_tagsADD);
        }
      } else {
        for (let i = 0; i < req_tags.length; i++) {
          if (req_tags[i] == req_tagsADD) {
            temp = true;
            break;
          }
        }
        if (temp == false) {
          // console.log("333333");
          last_id = await modelTagPost.add_tag(insert_Tags);
          //xxx
        }
      }

      //Insert value to Tag_post Table
      insert_Tag_post = {
        tag: last_id.insertId,
        post: id,
        create_date: null,
        modifile_date: null,
        delete: 0,
      };
      await modelTagPost.add_tp(insert_Tag_post);
    }

    // // Case Tags added has more tags.
    else if (Array.isArray(req_tagsADD) == true) {
      let temp = false;
      let last_id = null;

      if (checkTagNumber == 1) {
        for (let i = 0; i < req_tagsADD.length; i++) {
          insert_Tags = {
            name: req_tagsADD[i],
            des: req_tagsADD[i],
            create_date: null,
            modifile_date: null,
            delete: 0,
          };
          last_id = await modelTagPost.add_tag(insert_Tags);
          insert_Tag_post = {
            tag: last_id.insertId,
            post: id,
            create_date: null,
            modifile_date: null,
            delete: 0,
          };
          await modelTagPost.add_tp(insert_Tag_post);
          //xxx
        }
      } else if (checkTagNumber == 2) {
        for (let i = 0; i < req_tagsADD.length; i++) {
          if (req_tags != req_tagsADD[i]) {
            insert_Tags = {
              name: req_tagsADD[i],
              des: req_tagsADD[i],
              create_date: null,
              modifile_date: null,
              delete: 0,
            };
            last_id = await modelTagPost.add_tag(insert_Tags);
            insert_Tag_post = {
              tag: last_id.insertId,
              post: id,
              create_date: null,
              modifile_date: null,
              delete: 0,
            };
            await modelTagPost.add_tp(insert_Tag_post);
            //xxx
          }
        }
      } else {
        for (let i = 0; i < req_tagsADD.length; i++) {
          for (let j = 0; j < req_tags.length; j++) {
            if (req_tags[j] == req_tagsADD[i]) {
              temp = true;
              break;
            }
          }
          if (temp == false) {
            insert_Tags = {
              name: req_tagsADD[i],
              des: req_tagsADD[i],
              create_date: null,
              modifile_date: null,
              delete: 0,
            };
            last_id = await modelTagPost.add_tag(insert_Tags);
            insert_Tag_post = {
              tag: last_id.insertId,
              post: id,
              create_date: null,
              modifile_date: null,
              delete: 0,
            };
            await modelTagPost.add_tp(insert_Tag_post);
            //xxx
          }
        }
      }
    }

    //Update publish_date
    if (req_dateP != list[0].publish_date) {
      await modelTagPost.patch_post(request_);
    }
    //Update Category
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
