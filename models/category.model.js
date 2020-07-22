const db = require('../db/util/db');
const moment = require('moment');

const TBL_Cat1 = 'category_level1';
const TBL_Cat2 = 'category_level2';

module.exports = {
    load: () => db.load(`select cat1.id id_cat1, cat1.name cat1,cat2.id id_cat2, cat2.name cat2 from ${TBL_Cat2} cat2 
    join ${TBL_Cat1} cat1 on cat2.category_level1 = cat1.id and cat1.delete = 0 and cat2.delete = 0`),
    load_cat1: () => db.load(`select cat1.id id,cat1.name name from ${TBL_Cat1} cat1 where cat1.delete = 0`),
    load_cat2: () => db.load(`select cat2.id id,cat2.name name,cat2.category_level1 from ${TBL_Cat2} cat2 where cat2.delete = 0`)
};



