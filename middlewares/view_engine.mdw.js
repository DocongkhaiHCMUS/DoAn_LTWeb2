const hbs = require('express-handlebars');
const hbs_session = require('express-handlebars-sections');

module.exports = function (app) {
    app.engine('hbs', hbs({
        defaultLayout: 'main.hbs',
        helpers:
        {
            section: hbs_session(),
        }
    }));
    app.set('view engine', 'hbs');
};