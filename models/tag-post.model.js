const db = require('../db/util/db');
const moment = require('moment');
const mysql = require('mysql');
const config = require('../db/config/config.json');
var pool = mysql.createPool(config.mysql);

const TBL_TP = 'tag_post';
const TBL_Tag = 'tag';

module.exports = {
    load: () => db.load(`select tp.id, tp.tag, tag.name, tp.post from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.delete = 0`),

    singleByPost: (postID) => {
        return db.load(`select tp.id, tp.tag, tag.name from ${TBL_TP} tp join ${TBL_Tag} tag on tp.tag = tag.id and tp.post = '${postID}' 
                        and tp.delete = 0`)
    },

    add: (entity) => {

        //entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        //entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

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

    patch: (entity) => {
        const condition = {
            id: entity.id
        }

        delete entity.id;

        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.patch(TBL_TP, entity, condition)
    },
    patch_post: (entity) => {
        return new Promise(function (resolve, reject) {
            const sql = `   UPDATE post
                            SET category = ${entity.category}
                            WHERE id = ${entity.id}`;          
            pool.query(sql, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },
    patch_tag: (entity) => {
        return new Promise(function (resolve, reject) {
            const sql = `   UPDATE tag
                            SET name = null
                            WHERE id = ${entity}`;          
            pool.query(sql, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },

    undo_tag: (entity) => {
        return new Promise(function (resolve, reject) {
            const sql = `   update tag 
                            set name = des`;
            pool.query(sql, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },
};
