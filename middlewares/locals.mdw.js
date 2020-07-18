const modelCategory = require('../models/category.model');

// split all category level 1 push into a list
function convertToCat1(list) {
    let cat1_temp = [];
    let cat1 = [];
    for (let item of list) {

        // if cat1 doesn't contains item then push item
        if (cat1_temp.includes(item['cat1']) == false)
            cat1_temp.push(item['cat1']);
    }
    for (let item of cat1_temp) {
        cat1.push({ 'nameCat1': item });
    }
    return cat1;
}

//split all category level 2 follow each category level 1 and push into list object 
function convertToCatFull(list, cat1) {
    let temp = [];
    let old_cat1;
    let i = 0;
    for (let item of list) {

        // if end of category level 1 , push list category level 2 into object category level 1 and start next
        if (old_cat1 != item['cat1'] && temp.length != 0) {
            cat1[i]['list'] = temp;
            old_cat1 = item['cat1'];
            i++;
            temp = [];
            temp.push({ "nameCat2": item['cat2'] });
        }
        else {
            temp.push({ "nameCat2": item['cat2'] });
            old_cat1 = item['cat1'];
        }
    }
    cat1[i]['list'] = temp;
    return cat1;
}

module.exports = function (app) {
    app.use(async function (req, res, next) {
        const listCategory = await modelCategory.load();

        //local categories
        let listCat1 = convertToCat1(listCategory);
        app.locals.listCat = convertToCatFull(listCategory, listCat1);

        //local Authentication
        if (req.session.isAuthenticated && req.session.authUser) {
            res.locals.isAuthenticated = req.session.isAuthenticated;
            res.locals.user = req.session.authUser;
        }

        next();
    });
};
