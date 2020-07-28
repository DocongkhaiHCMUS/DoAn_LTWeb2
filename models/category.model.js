const db = require('../db/util/db');
const moment = require('moment');

const TBL_Cat1 = 'category_level1';
const TBL_Cat2 = 'category_level2';

module.exports = {
    load: () => db.load(`select cat1.name cat1, cat2.name cat2 from ${TBL_Cat2} cat2 join ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id`),
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
    single1: function (id) {
        return db.load(`select * from ${TBL_Cat1} where id = ${id}`);
    },
    single2: function (id) {
        return db.load(`select * from ${TBL_Cat2} where category_level1 = ${id}`);
    },
    patch1: function (entity) {
        const condition = {
            id: entity.id
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        delete entity.id;
        return db.patch(TBL_Cat1, entity, condition);
    },
    delele1: function (ID) {
        const condition = {
            id: ID
        }
        return db.delele(TBL_Cat1, condition);
    }
};



