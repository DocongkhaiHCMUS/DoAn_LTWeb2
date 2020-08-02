const mysql = require('mysql');
const config = require('../config/config.json');

var pool = mysql.createPool(config.mysql);

module.exports = {
    load: function (sql) {
        return new Promise(function (resolve, reject) {
            pool.query(sql, function (error, results, fields) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },

    add: function (table, entity) {
        return new Promise(function (resolve, reject) {
            const sql = `insert into ${table} set ?`;
            pool.query(sql, entity, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },

    patch: function (table, entity, condition) {
        return new Promise(function (resolve, reject) {
            const sql = `update ${table} set ? where ?`;
            pool.query(sql, [entity, condition], function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    },
    delete: function(table, ID){
        return new Promise(function(resolve,reject){
            const sql =`delete from ${table} where ?`;
            pool.query(sql,ID,function(error,results){
                if(error){
                    return reject(error);
                }

                resolve(results);
            })
        })
    },
    deleteAllCat2: function(ID){
        return new Promise(function(resolve,reject){
            const sql =`update category_level2 cat2 set cat2.delete = 1 where cat2.category_level1 = ${ID}`;
            pool.query(sql,ID, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        })
    },
    deleteAllTagPostByTag: function(ID){
        return new Promise(function(resolve,reject){
            const sql =`update tag_post tp set tp.delete = 1 where tp.tag = ${ID}`;
            pool.query(sql,ID, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        })
    },
    deleteAllTagPostByPost: function(ID){
        return new Promise(function(resolve,reject){
            const sql =`update tag_post tp set tp.delete = 1 where tp.post = ${ID}`;
            pool.query(sql,ID, function (error, results) {
                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        })
    },
};
