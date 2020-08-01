const db = require('../db/util/db');
const moment = require('moment');

const TBL_TP = 'tag_post';
const TBL_Tag = 'tag';
const TBL_Post = 'post';
module.exports = {
    load: () => db.load(`select tp.id, tp.tag, tag.name, tp.post from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.delete = 0`),

    singleByPost: (postID) => {
        return db.load(`select tp.id, tp.tag, tag.name from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.post = '${postID}' 
                        and tp.delete = 0`)
    },
    singleByTag: (tagID) => {
        return db.load(`select tag.id as tagid,tag.des as tagdes,p.id as postid ,p.title,tp.delete,tp.id as tpid from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id join ${TBL_Post} p on p.id = tp.post where tag.id = '${tagID}'`)
    },
    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_TP, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }

        let entity = {
            delete: 1
        }

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');


        return db.patch(TBL_TP, entity, condition)
    },
    restore: (ID) => {
        let condition = {
            id: ID
        }

        let entity = {
            delete: 0
        }

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');


        return db.patch(TBL_TP, entity, condition)
    },

    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_TP, entity, condition)
    }
};
