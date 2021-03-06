const hbs = require('express-handlebars');
const hbs_session = require('express-handlebars-sections');
const moment = require('moment');

module.exports = function (app) {
    app.engine('hbs', hbs({
        // defaultLayout: 'index.hbs',
        helpers:
        {
            section: hbs_session(),
            parseTime: (time) => {
                moment.locale('vi');
                return moment(time).format('HH:mm, DD/MM/YYYY');
            },
            stripStr: (str) => {
                if (str != undefined && str != null)
                    return str.strip();
                return '';
            }
        }
    }));
    app.set('view engine', 'hbs');
};