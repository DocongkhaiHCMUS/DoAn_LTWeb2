const db = require('../db/util/db');
const moment = require('moment');

const TBL_UC = 'user_comment';
const TBL_USER = 'user';
const TBL_POST = 'post';

module.exports = {
    loadByPost: (idPost) => db.load(`select uc.*, us.display_name, us.avatar from ${TBL_UC} uc join ${TBL_USER} us on uc.user = us.id and uc.post = ${idPost}  where uc.delete = 0`),
    add: (entity) => {

        entity['create_date'] = moment().format('YYYY/MM/DD HH:mm:ss');
        entity['modifile_date'] = moment().format('YYYY/MM/DD HH:mm:ss');

        return db.add(TBL_UC, entity);
    }
};
