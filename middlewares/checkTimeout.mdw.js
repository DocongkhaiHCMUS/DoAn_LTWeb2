const moment = require('moment');

module.exports = function (req, res, next) {
    if (req.app.locals.lcSubcriber) {
        try {
            let diff = moment().diff(moment(req.session.authUser.time_out), 'minute')
            if (diff > 0) {
                req.logOut();
                req.session.destroy(function (err) {
                    console.log(err);
                    // res.redirect('/');
                });

                req.app.locals.lcUser = null;
                req.app.locals.lcIsAuthenticated = false;
                req.app.locals.lcSubcriber = false;
                req.app.locals.lcEditor = false;
                res.render("timeout.hbs", {
                    layout: false
                });
            }
            else {
                next();
            }
        }
        catch (err) {
            req.logOut();
            req.session.destroy(function (err) {
                console.log(err);
                // res.redirect('/');
            });

            req.app.locals.lcUser = null;
            req.app.locals.lcIsAuthenticated = false;
            req.app.locals.lcSubcriber = false;
            req.app.locals.lcEditor = false;
            res.render("timeout.hbs", {
                layout: false
            });
        }
    }
    else {
        next();
    }
};
