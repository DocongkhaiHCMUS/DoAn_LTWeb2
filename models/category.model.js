const db = require('../db/util/db');
const moment = require('moment');

const TBL_Cat1 = 'category_level1';
const TBL_Cat2 = 'category_level2';

module.exports = {
    load: ()=> db.load(`select cat1.name cat1, cat2.name cat2 from ${TBL_Cat2} cat2 join ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id`)
};



