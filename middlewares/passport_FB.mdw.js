const passport = require('passport');
const config = require('../db/config/config.json');
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function (app) {

    // Passport session setup. 
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    // Use FacebookStrategy with Passport.
    passport.use(new FacebookStrategy({
        clientID: config.passport_FB.FACEBOOK_CLIENT_ID,
        clientSecret: config.passport_FB.FACEBOOK_CLIENT_SECRET,
        callbackURL: config.passport_FB.callback_url
    },
        function (accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
                //console.log(accessToken, refreshToken, profile, done);
                return done(null, profile);
            });
        }
    ));

    app.use(passport.initialize());
    app.use(passport.session());

};
