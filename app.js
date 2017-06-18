var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let glob = require('glob');
let cors = require('cors');

var db = require('../alladin-database/index');
let config = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

db.Promise = global.Promise;
db.connect(config.DB_URL);

app.set('db', db);
app.set('config', config);
//app.set('superSecret', config.sec)

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


let middlewares = glob.sync('./middleware/*.js');
middlewares.forEach((middleware) => {
  require(middleware)(app, db);
});

let preRoutes = {};
let filters = glob.sync('./preroutes/*.js');
filters.forEach((filter) => {
  require(filter)(preRoutes, app, db);
});
app.set('filters', preRoutes);

let routes = glob.sync('./routes/*.js');
routes.forEach((route) => {
  require(route)(app, db);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
