const db = require("../db/util/db");
const moment = require("moment");
const { text } = require("express");

const TBL_Post = "post";
const TBL_Cat2 = "category_level2";
const TBL_Tag = "tag";
const TBL_TagPost = "tag_post";

module.exports = {
  load: () => db.load(`select * from ${TBL_Post} p where p.delete = 0`),
  loadSortByTitle: () =>
    db.load(`select * from ${TBL_Post} p where p.delete = 0 order by title`),
  // load_home:() => db.load(`select p.id,p.title,p.avatar,p.folder_img, p.tiny_des, p.views.p.categories,
  //                         p.publish_date from ${TBL_Post}`),

  singleByID: (ID) => {
    return db.load(
      `select * from ${TBL_Post} p where p.id = ${ID} and p.delete = 0`
    );
  },
  singleByID2: (ID) => {
    return db.load(
      `select p.*,u.id as id_user from ${TBL_Post} p left join user u on p.author = u.id where p.id = ${ID} `
    );
  },

  singleByIDCat1_page: (idCat1, limit, offset) => {
    return db.load(`select p.*, cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        and cat2.category_level1 = ${idCat1} and p.delete =0 limit ${limit} offset ${offset}`);
  },

  countByIDCat1: (idCat1) => {
    return db.load(`select count(*) as total from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        and cat2.category_level1 = ${idCat1} and p.delete =0`);
  },

  singleByIDCat2_page: (idCat2, limit, offset) => {
    return db.load(`select p.*,cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        where p.category = ${idCat2} and p.delete =0 limit ${limit} offset ${offset}`);
  },

  countByIDCat2: (idCat2) => {
    return db.load(
      `select count(*) as total from ${TBL_Post} p where p.category = ${idCat2} and p.delete =0`
    );
  },

  singleByIDCat2: (idCat2) => {
    return db.load(
      `select p.*,cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id where p.category = ${idCat2} and p.delete =0`
    );
  },

  singleByIDTag_page: (idTag, limit, offset) => {
    return db.load(`select p.*,tag.name as tag_name from ${TBL_Post} p join ${TBL_TagPost} tp on p.id = tp.post join 
                        ${TBL_Tag} tag on tp.tag = tag.id and tag.id = ${idTag} where p.delete = 0 limit ${limit} offset ${offset}`);
  },
  countByIDTag: (idTag) => {
    return db.load(`select count(*) as total from ${TBL_Post} p join ${TBL_TagPost} tp on p.id = tp.post join 
                            ${TBL_Tag} tag on tp.tag = tag.id and tag.id = ${idTag} where p.delete = 0`);
  },

  searchText: (text, limit, offset) => {
    return db.load(`SELECT p.* FROM ${TBL_Post} p
        WHERE MATCH (title,tiny_des,full_des) 
        AGAINST ('${text}' IN NATURAL LANGUAGE MODE)
        limit ${limit} offset ${offset}
        `);
  },

  countSearchText: (text) => {
    return db.load(`SELECT count(*) as total FROM ${TBL_Post}
        WHERE MATCH (title,tiny_des,full_des) 
        AGAINST ('${text}' IN NATURAL LANGUAGE MODE)
        `);
  },

  add: (entity) => {
    entity["create_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.add(TBL_Post, entity);
  },

  delete: (ID) => {
    let condition = {
      id: ID,
    };

    let entity = {
      delete: 1,
    };

    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

    return db.patch(TBL_Post, entity, condition);
  },

  patch: (entity) => {
    const condition = {
      id: entity.id,
    };

    delete entity.id;

    entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    entity["publish_date"] = moment().format("YYYY/MM/DD HH:mm:ss");
    return db.patch(TBL_Post, entity, condition);
  },
  pageByPost: function (limit, offset) {
    return db.load(
      `select * from ${TBL_Post} order by title limit ${limit} offset ${offset} `
    );
  },
  countByPost: async function () {
    const rows = await db.load(`select count(*) as total from ${TBL_Post}`);
    return rows[0].total;
  },
  deteleAllTagPostByPost: function (id) {
    return db.deleteAllTagPostByPost(id);
  },
  singlePostById: function (id) {
    return db.load(`select * from ${TBL_Post} where id = ${id}`);
  },
  deteleAllPostByCat2: function (id) {
    return db.deleteAllPostByCat2(id);
  },
};
