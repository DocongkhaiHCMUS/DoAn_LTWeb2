const db = require('../db/util/db');
const moment = require('moment');

const TBL_IC = 'image_caption';

module.exports = {
    load: () => db.load(`select * from ${TBL_IC}`),

    singleByFolder: (folderName) => {
        return db.load(`select ic.id, ic.name_img, ic.caption,ic.folder from ${TBL_IC} ic where ic.folder = '${folderName}' 
                        and ic.delete = 0`)
    },

    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_IC, entity)
    },

    delete: (ID) => {
        let condition = {
            id: ID
        }

        let entity = {
            delete: 1
        }

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');


        return db.patch(TBL_IC, entity, condition)
    },

    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_IC, entity, condition)
    }
};
