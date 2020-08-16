const db = require("../db/util/db");
const moment = require("moment");

const TBL_Post = 'post';
const TBL_Cat2 = 'category_level2';
const TBL_Tag = 'tag';
const TBL_TagPost = 'tag_post';
const TBL_Cat1 = 'category_level1';


module.exports = {
  load: () => db.load(`select * from ${TBL_Post} p where p.delete = 0`),
  loadSortByTitle: (id) =>
    db.load(`SELECT p.id,p.title FROM ${TBL_Post} p  WHERE p.delete = 0 and p.id NOT IN (SELECT tp.post FROM tag_post tp WHERE tp.tag =${id} )`),
  // load_home:() => db.load(`select p.id,p.title,p.avatar,p.folder_img, p.tiny_des, p.views.p.categories,
  //                         p.publish_date from ${TBL_Post}`),

  postTag: () => {
    return db.load(`SELECT p.*, GROUP_CONCAT(tag.name) as 'tags'
                    FROM tag_post tp, tag tag, post p
                    WHERE tp.tag = tag.id AND p.id = tp.post
                    GROUP by p.id`);
  },
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
        `)
    },

    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_Post, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }

        let entity = {
            delete: 1
        }

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_Post, entity, condition)
    },

    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['publish_date'] = moment(entity['publish_date'],'HH:mm, DD/MM/YYYY').format('YYYY/MM/DD HH:mm:ss');
        return db.patch(TBL_Post, entity, condition)
    },

    //khoi
    selectByAuthor: (author) => {
        return db.load(`select p.id, title, avatar, folder_img, tiny_des, full_des, views, 
                        publish_date,c1.name as cat1name, c2.name as cat2name, c1.id as cat1id, c2.id as cat2id, p.status, p.reason
                        from ${TBL_Post} p join ${TBL_Cat1} c1 join ${TBL_Cat2} c2 
                        where p.category = c2.id and c2.category_level1 = c1.id and p.author = ${author} and p.delete = 0`)
    },
    selectNameCat1: ()=>{
        return db.load(`select id, name from ${TBL_Cat1} c1 where c1.delete = 0`)
    },
    selectNameCat2: ()=>{
        return db.load(`select id, name from ${TBL_Cat2} c2 where c2.delete = 0`)
    },
    selectNameCat1Cat2: ()=>{
        return db.load(`SELECT c1.id as cat1id, c1.name as cat1name, c2.id as cat2id, c2.name as cat2name 
                        FROM ${TBL_Cat1} c1 JOIN ${TBL_Cat2} c2 
                        WHERE c1.id=c2.category_level1`)
    },
    selectPostByID:(id)=>{
        return db.load(`select p.id, p.title, p.tiny_des, p.full_des, p.avatar,p.folder_img, 
                        c1.name as cat1name,c2.name as cat2name, p.category
                        from ${TBL_Post} p join ${TBL_Cat2} c2 join ${TBL_Cat1} c1
                        where p.category = c2.id and c2.category_level1=c1.id and p.id=${id} and p.delete = 0`)
    },
    countPostByAuthor:(author)=>{
        return db.load(`select count(*) as n from ${TBL_Post} p where p.author = ${author} and p.delete = 0`)
    },
    selectMaxNumberOfFolder:(category)=>{
        return db.load(`SELECT folder_img FROM ${TBL_Post} WHERE category = ${category}`)
    },
    selectFolderNameByIDPost:(id)=>{
        return db.load(`SELECT folder_img FROM ${TBL_Post} WHERE id = ${id} `)
    },
    selectTag:()=>{
        return db.load(`SELECT * FROM ${TBL_Tag} `)
    },
    selectTag_Post:(id)=>{
        return db.load(`SELECT t.id, t.name, tp.tag FROM ${TBL_Post} p JOIN ${TBL_TagPost} tp JOIN ${TBL_Tag} t WHERE p.id = tp.post AND tp.tag = t.id AND p.id = ${id} and tp.delete=0`)
    },
    selectMaxIDPost:()=>{
        return db.load(`select MAX(id) as max FROM ${TBL_Post}`)
    },
    addTag_Post: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_TagPost, entity)
    },
    patchTag_Post: (entity) => {
        const condition = {
            post: entity.post
        }

        delete entity.post;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_TagPost, entity, condition)
    },

    //
    pageByPost: function (limit, offset) {
      return db.load(
        `select * from ${TBL_Post} order by create_date desc limit ${limit} offset ${offset} `
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
    selectAllTagByPost: function (post) {
      return db.load(`SELECT tag FROM tag_post WHERE post = ${post}`);
    }
    
};
