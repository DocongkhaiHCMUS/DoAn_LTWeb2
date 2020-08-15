const express = require('express');

//registerHelper
var hbs = require('handlebars');
hbs.registerHelper("when", (operand_1, operator, operand_2, options) => {
    let operators = {
      'eq': (l,r) => l == r,              
      'noteq': (l,r) => l != r,
      'gt': (l,r) => (+l) > (+r),                        
      'gteq': (l,r) => ((+l) > (+r)) || (l == r),        
      'lt': (l,r) => (+l) < (+r),                        
      'lteq': (l,r) => ((+l) < (+r)) || (l == r),        
      'or': (l,r) => l || r,                             
      'and': (l,r) => l && r,                            
      '%': (l,r) => (l % r) === 0
    }
    let result = operators[operator](operand_1,operand_2);
    if(result) return options.fn(this); 
    return options.inverse(this);       
  });

//decalre library to control throw async error
require('express-async-errors');

const app = express();
app.use(express.urlencoded({
    extended: true
}));

//set static folder public
app.use('/public', express.static('public'));

//config view_engine and libraries helper as hbs-sections
require('./middlewares/view_engine.mdw')(app);

//declare session
require('./middlewares/session.mdw')(app);

//require function check is login
const restrict = require('./middlewares/authenticated.mdw');

//require local variables
require('./middlewares/locals.mdw')(app);

// CODE IN HERE

//set layout for guest
app.use(require('./middlewares/set_layout_guest.mdw'));

//set link home
app.get('/', require('./routers/home.route'))

//require all router
app.use('/guest', require('./routers/default.route'));

app.use('/sub', require('./routers/subscriber.route'));

app.use('/writer', require('./routers/writer.route'));

app.use('/admin', require('./routers/admin.route'));

app.use('/editor', require('./routers/editor.route'));

app.use('/login', require('./routers/login.route'));

app.use('/register', require('./routers/register.route'));

app.use('/post', require('./routers/post.route'));

app.use('/category', require('./routers/category.route'));

app.use('/tag', require('./routers/tag.route'));

app.use('/user', require('./routers/user.route'));

app.use('/pass', require('./routers/password.route'));

app.use('/comment', require('./routers/comment.route'));

app.use('/search', require('./routers/search.route'));


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
app.listen(PORT, () => {
    console.log(`App is running at http://localhost:3000 :))) !`);
})
