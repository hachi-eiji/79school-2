///<reference path="typings/express-session/express-session.d.ts"/>
///<reference path="typings/morgan/morgan.d.ts"/>
///<reference path="typings/cookie-parser/cookie-parser.d.ts"/>
///<reference path="typings/body-parser/body-parser.d.ts"/>
///<reference path="typings/mongoose/mongoose.d.ts"/>

import express = require('express');
import session = require('./libs/session');
import Error = require('./libs/Error');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import mongoose = require('mongoose');

var path = require('path');
var session = require('express-session');
var MongoSession = require('connect-mongo')(session);
var http = require('http');
var domain = require('domain');
var appLog = require('log4js').getLogger();
var libs = require('./libs');
var routes = require('./routes');

mongoose.connect(libs.config.mongo.url, {safe: true}, function (err:any) {
  if (err) {
    appLog.fatal('can not connect to MongoDB', err.stack);
    process.exit(1);
  }
});

if (!libs.config.gitHubAuth.client_id && !libs.config.gitHubAuth.secret) {
  appLog.fatal('can not GitHub client_id or secret. please export NODE_GITHUB_SECRET and NODE_GITHUB_SECRET');
  process.exit(1);
}

var app = express();

app.locals.title = "きいて"; // application title.
app.locals.githubClientId = libs.config.gitHubAuth.client_id;

app.set('port', libs.config.application.port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('test'));
app.use(session({secret: 'test', store: new MongoSession({mongooseConnection: mongoose.connection})}));
app.use(express.static(path.join(__dirname, 'public')));

// uncaught exception.
app.use(function (req, res, next) {
  var d = domain.create();
  d.on('error', function (err:any) {
    appLog.error(err.stack);
  });
  d.run(next);
});

app.use(function (req, res, next) {
  if (req.session && (<session.ApplicationSession>req.session).user) {
    res.locals.user = (<session.ApplicationSession>req.session).user;
  }
  next();
});

// URL mapping
app.get('/', routes.index);
app.get('/items/new', routes.item.showCreate);
app.post('/items/create', routes.item.register);
app.get('/items/reply/list', routes.reply.getList);
app.post('/items/reply', routes.reply.register);
app.get('/items/:id/edit', libs.acl.myItem, routes.item.showEdit);
app.post('/items/:id/edit', libs.acl.myItem, routes.item.update);
app.post('/items/:id/remove', libs.acl.myItem, routes.item.remove);
app.post('/items/:id/like', libs.acl.login, routes.item.like);
app.use('/items/:id', routes.item.show);

// logout
app.use('/user/logout/', routes.user.logout);
// auth
app.use('/auth/github/callback', routes.user.gitHubAuthCallback);

// debug
app.use('/debug/login', routes.user.debugLogin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err:Error = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err:Error, req:express.Request, res:express.Response, next:Function) {
    appLog.error(err.stack);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err:Error, req:express.Request, res:express.Response, next:Function) {
  appLog.error(err.stack);
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
