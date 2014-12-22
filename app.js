var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var http = require('http');
var domain = require('domain');
var models = require('./models');
// database config
var mongoose = require('mongoose');
var db = mongoose.connect(process.env.NODE_MONGO_URL || 'mongodb://@localhost:27017/test', {safe: true});
var routes = require('./routes');
var config = require('./libs').config;
var app = express();

// set model
app.use(function (req, res, next) {
  req.models = models;
  return next();
});

app.locals.title = "きいて"; // application title.
app.locals.githubClientId = config.gitHubAuth.client_id;

app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('test'));
app.use(session({secret: 'test'}));
app.use(express.static(path.join(__dirname, 'public')));

// uncaught exception.
app.use(function (req, res, next) {
  var d = domain.create();
  d.on('error', function (err) {
    console.error(err);
  });
  d.run(next);
});

app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

// URL mapping
app.get('/', routes.index);
app.get('/items/new', routes.item.showCreate);
app.post('/items/create', routes.item.register);
app.get('/items/:id/edit', routes.item.showEdit);
app.post('/items/:id/edit', routes.item.update);
app.use('/items/:id', routes.item.show);

// auth
app.use('/auth/github/callback', routes.user.gitHubAuthCallback);

// debug
app.use('/debug/login', routes.user.debugLogin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = http.createServer(app);
var startup = function () {
  server.listen(app.get('port'), function () {
    console.log('running server.. port:', app.get('port'));
  });
};

var shutdown = function () {
  server.close();
};

if (require.main === module) {
  startup();
} else {
  exports.startup = startup;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
