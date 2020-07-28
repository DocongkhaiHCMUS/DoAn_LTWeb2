const db = require('../db/util/db');
const moment = require('moment');

const TBL_TP = 'tag_post';
const TBL_Tag = 'tag';

module.exports = {
    load: () => db.load(`select tp.id, tp.tag, tag.name, tp.post from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.delete = 0`),

    singleByPost: (postID) => {
        return db.load(`select tp.id, tp.tag, tag.name from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.post = '${postID}' 
                        and tp.delete = 0`)
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
