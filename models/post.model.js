const db = require('../db/util/db');
const moment = require('moment');

const TBL_Post = 'post';
const TBL_Cat2 = 'category_level2';

module.exports = {
    load: () => db.load(`select * from ${TBL_Post} p where p.delete = 0`),

    // load_home:() => db.load(`select p.id,p.title,p.avatar,p.folder_img, p.tiny_des, p.views.p.categories,
    //                         p.publish_date from ${TBL_Post}`),

    singleByID: (ID) => {
        return db.load(`select * from ${TBL_Post} p where p.id = ${ID} and p.delete = 0`)
    },

    singleByIDCat1_page: (idCat1, limit, offset) => {
        return db.load(`select p.*, cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        and cat2.category_level1 = ${idCat1} and p.delete =0 limit ${limit} offset ${offset}`)
    },

    countByIDCat1: (idCat1) => {
        return db.load(`select count(*) as total from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        and cat2.category_level1 = ${idCat1} and p.delete =0`)
    },

    singleByIDCat2_page: (idCat2, limit, offset) => {
        return db.load(`select p.*,cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id 
        where p.category = ${idCat2} and p.delete =0 limit ${limit} offset ${offset}`)
    },

    countByIDCat2: (idCat2) => {
        return db.load(`select count(*) as total from ${TBL_Post} p where p.category = ${idCat2} and p.delete =0`)
    },

    singleByIDCat2: (idCat2) => {
        return db.load(`select p.*,cat2.name nameCat2 from ${TBL_Post} p join ${TBL_Cat2} cat2 on p.category = cat2.id where p.category = ${idCat2} and p.delete =0`)
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

        return db.patch(TBL_Post, entity, condition)
    }
};
