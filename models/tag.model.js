const db = require('../db/util/db');
const moment = require('moment');
const TBL_Tag = 'tag';

module.exports = {
    All: () => db.load(`select * from ${TBL_Tag}`),
    load: () => db.load(`select t.* from ${TBL_Tag} t where t.delete = 0`),
    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.add(TBL_Tag, entity)
    },
    singleTagById: function (id) {
        return db.load(`select * from ${TBL_Tag} where id = ${id}`);
    },
    patch: function (entity) {
        const condition = {
            id: entity.id
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        delete entity.id;
        return db.patch(TBL_Tag, entity, condition);
    },
    deteleAllTagPostByTag: function (id) {
        return db.deleteAllTagPostByTag(id);
    },
    pageByTag: function (limit, offset) {
        return db.load(`select * from ${TBL_Tag} order by create_date desc limit ${limit} offset ${offset} `);
    },
    countByTag: async function () {
        const rows = await db.load(`select count(*) as total from ${TBL_Tag}`);
        return rows[0].total;
    },
};