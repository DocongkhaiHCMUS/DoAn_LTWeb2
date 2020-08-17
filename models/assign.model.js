const db = require('../db/util/db');
const moment = require('moment');

const TBL_Assign = 'assign';

module.exports = {
    load: () => db.load(`select us.* from ${TBL_Assign} us where`),
    singleByUser: (ID) => db.load(`select us.*,cat1.id as idcat,cat1.name  from ${TBL_Assign} us join category_level1 cat1 on us.category = cat1.id where us.user =${ID} and us.delete = 0`),
    singleCatByID: (ID) => db.load(`select cat1.id as idcat,cat1.name  from ${TBL_Assign} us join category_level1 cat1 on us.category = cat1.id where us.user =${ID} and us.delete = 0`),
    countByEditor: async function (user) {
        const rows = await db.load(`select count(*) as total from ${TBL_Assign} ass where ass.delete =0 and ass.user=${user}`);
        return rows[0].total;
    },
    singleByUser2: (ID) => db.load(`select us.*,cat1.id as idcat,cat1.name  from ${TBL_Assign} us join category_level1 cat1 on us.category = cat1.id where us.user =${ID}`),
    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_Assign, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }
        let entity = {
            delete: 1
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.patch(TBL_Assign, entity, condition)
    },
    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_Assign, entity, condition)
    },
    restore: (ID) => {
        let condition = {
            id: ID,
        };

        let entity = {
            delete: 0,
        };

        entity["modifile_date"] = moment().format("YYYY/MM/DD HH:mm:ss");

        return db.patch(TBL_Assign, entity, condition);
    }
};
