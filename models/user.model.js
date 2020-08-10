const db = require('../db/util/db');
const moment = require('moment');

const TBL_User = 'user';

module.exports = {
    load: () => db.load(`select * from ${TBL_User}`),

    singleByUserName: (userName) => {
        return db.load(`select * from ${TBL_User} where user_name = '${userName}'`)
    },

    singleByID: (ID) => {
        return db.load(`select * from ${TBL_User} where id = ${ID}`)
    },

    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_User, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }

        let entity = {
            delete: 1
        }

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        return db.patch(TBL_User, entity, condition)
    },
    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_User, entity, condition)
    }
};
