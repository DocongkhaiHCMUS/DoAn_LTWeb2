const db = require("../db/util/db");
const moment = require("moment");

const TBL_TP = "tag_post";
const TBL_Tag = "tag";
const TBL_Post = "post";
module.exports = {
  load: () =>
    db.load(
      `select tp.id, tp.tag, tag.name, tp.post from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.delete = 0`
    ),
  singleByTagPost: (idTag, idPost) => {
    return db.load(`select tp.id, tp.tag, tag.name from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.tag = '${idTag}' and tp.post = ${idPost} 
    and tp.delete = 0`);
  },

  singleByPost: (postID) => {
    return db.load(`select tp.id, tp.tag, tag.name from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.post = '${postID}' 
                        and tp.delete = 0`);
  },
  singleByTag: (tagID) => {
    return db.load(
      `select tag.id as tagid,tag.des as tagdes,p.id as postid ,p.title,tp.delete,tp.id as tpid from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id join ${TBL_Post} p on p.id = tp.post where tag.id = '${tagID}'`
    );
  },
  postInTagPost: (postID) => {
    return db.load(
      `select p.id as postid, t.id as tagid ,t.name as tagname, tp.* from ${TBL_Post} p join ${TBL_TP} tp on p.id = tp.post join ${TBL_Tag} t on t.id = tp.tag where p.id = '${postID}'`
    );
  },
  add: (entity) => {
    entity["create_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.add(TBL_TP, entity);
  },
  add_tag: (entity) => {
    entity["create_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.add(TBL_Tag, entity);
  },
  add_tp: (entity) => {
    entity["create_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.add(TBL_TP, entity);
  },

  delete: (ID) => {
    let condition = {
      id: ID,
    };

    let entity = {
      delete: 1,
    };

    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.patch(TBL_TP, entity, condition);
  },

  restore: (ID) => {
    let condition = {
      id: ID,
    };

    let entity = {
      delete: 0,
    };

    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.patch(TBL_TP, entity, condition);
  },

  patch: (entity) => {
    const condition = {
      id: entity.id,
    };

    delete entity.id;

    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.patch(TBL_TP, entity, condition);
  },
  patch_post: (entity) => {
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    return db.patch_post(TBL_Post, entity);
  },
  patch_tag: (entity) => {
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    return db.patch_tag(TBL_Tag, entity);
  },
  undo_tag: (entity) => {
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    return db.undo_tag(TBL_Tag, entity);
  },
};
