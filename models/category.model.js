const db = require('../db/util/db');
const moment = require('moment');

const TBL_Cat1 = 'category_level1';
const TBL_Cat2 = 'category_level2';
const TBL_Assign = 'assign';

module.exports = {
    load: () => db.load(`select cat1.id id_cat1, cat1.name cat1,cat2.id id_cat2, cat2.name cat2 from ${TBL_Cat2} cat2 
    join ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id and cat1.delete = 0 and cat2.delete = 0`),
    load_cat1: () => db.load(`select cat1.id id,cat1.name name from ${TBL_Cat1} cat1 where cat1.delete = 0`),
    load_cat2: () => db.load(`select cat2.id id,cat2.name name,cat2.category_level1 from ${TBL_Cat2} cat2 where cat2.delete = 0`),
    loadCat1ByAssign: (id) => db.load(`select cat1.id id,cat1.name from ${TBL_Cat1} cat1 where cat1.delete = 0
     and cat1.id not in (select category from ${TBL_Assign} where user = ${id})`),
    singleCat1ByCat1Name: function (catname) {
        return db.load(`select t.name from ${TBL_Cat1} t where  UPPER(t.name) = UPPER('${catname}')`);
    },
    singleCat2ByCat1IDCat2Name: function (catname,id) {
        return db.load(`select t.name from ${TBL_Cat2} t where  UPPER(t.name) = UPPER('${catname}') and t.category_level1 =${id}`);
    },
    singleCatByIDCat2: (ID) => db.load(`select cat2.id id_cat2,cat2.name name_cat2,cat1.id id_cat1, cat1.name name_cat1 from ${TBL_Cat2} cat2 join 
    ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id and cat2.id = ${ID} and cat2.delete = 0`),
    loadCat1: () => db.load(`select * from ${TBL_Cat1} order by name`),
    loadCat2: () => db.load(`select * from ${TBL_Cat2} order by name`),
    countCat1: async function () {
        const count = await db.load(`select count(*) as total from ${TBL_Cat1}`);
        return count[0].total;
    },
    add1: function (entity) {
        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.add(TBL_Cat1, entity);
    },
    add2: function (entity) {
        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.add(TBL_Cat2, entity);
    },
    single1: function (id) {
        return db.load(`select * from ${TBL_Cat1} where id = ${id}`);
    },
    single2: function (id) {
        return db.load(`select * from ${TBL_Cat2} where category_level1 = ${id}`);
    },
    singleCat2ByID: function (id) {
        return db.load(`select * from ${TBL_Cat2} where id = ${id}`);
    },
    singleCat1ByCat2ID: async function (id) {
        const rows = await db.load(`select cat1.* from ${TBL_Cat2} cat2 join ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id where cat2.id = ${id} and cat1.delete = 0`);
        if(rows.length === 0){
            return null;
        }
        return rows[0];
    },
    patch1: function (entity) {
        const condition = {
            id: entity.id
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        delete entity.id;
        return db.patch(TBL_Cat1, entity, condition);
    },
    patch2: function (entity) {
        const condition = {
            id: entity.id
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        delete entity.id;
        return db.patch(TBL_Cat2, entity, condition);
    },
    delele1: function (ID) {
        const condition = {
            id: ID
        }
        return db.delele(TBL_Cat1, condition);
    },
    delAllCat2byCat1 :function(id){
        return db.deleteAllCat2(id);
    }
};



