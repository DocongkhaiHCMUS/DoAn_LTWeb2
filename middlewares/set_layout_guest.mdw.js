const express = require('express');
const router = express.Router();

router.all('/*', function (req, res, next) {
    req.app.locals.layout = 'index.hbs';
    next();
});

module.exports = router;
