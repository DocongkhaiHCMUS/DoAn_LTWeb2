const db = require('../db/util/db');
const moment = require('moment');

const TBL_Per = 'permision';

module.exports = {
    load: () => db.load(`select us.* from ${TBL_Per} us where us.delete =0 `),

    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_Per, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }
        let entity = {
            delete: 1
        }
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.patch(TBL_Per, entity, condition)
    },
    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_Per, entity, condition)
    }
};
