const db = require('../db/util/db');


const TBL_POST = 'post';
module.exports = {
    add: function (entity) {
      return db.add(TBL_POST, entity);
    },
    selectPostByAuthor: function (author) {
      return db.load(`select * from ${TBL_POST} where Author = ${author}`);
    },
    selectPostByID: function(id)
    {
      return db.load(`select * from ${TBL_POST} where id = ${id}`);
    },
    patch: function (entity) {
      const condition = {
        id: entity.id
      }
      delete entity.id;
      return db.patch(TBL_POST, entity, condition);
    }
  };