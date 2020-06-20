const express = require('express');

//decalre library to control throw async error
require('express-async-errors');

const app = express();

app.use(express.urlencoded({
    extended: true
}));

//set static folder public
app.use('./public', express.static('public'));

//set views
app.set("views",__dirname + "/apps/views");
//config view_engine and libraries helper as hbs-sections
require('./middlewares/view_engine.mdw')(app);

//require function check is login
const restrict = require('./middlewares/authenticated.mdw');

//require local variables
require('./middlewares/locals.mdw')(app);

//declare session
require('./middlewares/session.mdw')(app);



// CODE IN HERE




//error handling
app.get('/err', function (req, res) {
    throw new Error("just test :) !");
});
app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).render('500.hbs', { layout: false });
});

//not found handling
app.use(function (req, res) {
    res.render('404.hbs', { layout: false });
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log(`App is running at http://localhost:${PORT} :))) !`);
})