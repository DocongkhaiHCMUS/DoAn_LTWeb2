const express = require('express');
const hbs = require('express-handlebars');
const session = require('express-session');
const hbs_session = require('express-handlebars-sections');
require('express-async-error');

const app = express();

app.use('/public', express.static('public'));

