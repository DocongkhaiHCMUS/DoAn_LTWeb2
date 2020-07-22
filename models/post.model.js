const db = require('../db/util/db');
const moment = require('moment');

const TBL_Post = 'post';

module.exports = {
    load: () => db.load(`select * from ${TBL_Post}`),

    // load_home:() => db.load(`select p.id,p.title,p.avatar,p.folder_img, p.tiny_des, p.views.p.categories,
    //                         p.publish_date from ${TBL_Post}`),

    singleByID: (ID) => {
        return db.load(`select * from ${TBL_Post} where id = ${ID}`)
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
