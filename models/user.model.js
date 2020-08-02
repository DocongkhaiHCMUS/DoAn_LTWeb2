const db = require('../db/util/db');
const moment = require('moment');

const TBL_User = 'user';

module.exports = {
    load: () => db.load(`select us.* from ${TBL_User} us where us.delete =0 `),

    singleByUserName: (userName) => {
        return db.load(`select us.* from ${TBL_User} us where us.user_name = '${userName}' and us.delete =0 `)
    },

    singleByID: (ID) => {
        return db.load(`select us.* from ${TBL_User} us where us.id = ${ID} and us.delete =0`)
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
