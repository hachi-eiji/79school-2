/**
 * @module routes/user
 */
'use strict';
var User = require('../models').User;
var LoginFactory = require('../libs/service/login');

exports.logout = function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
};

exports.gitHubAuthCallback = function (req, res, next) {
  var referer = req.headers['referer'] || '/';
  if (req.session && req.session.user) {
    res.redirect(referer);
  }
  LoginFactory.create(LoginFactory.Type.GitHub).login(req.query.code, function (err, user) {
    if (err) {
      return next(err);
    }
    req.session.user = user;
    res.redirect(referer);
  });
};

// 多分本当はわけたほうがいいよね.
exports.debugLogin = function (req, res, next) {
  User.findOne({id: 1}, function (err, user) {
    if (err) {
      return next(err);
    }
    if(user) {
      req.session.user = user;
      res.status(200).end();
    } else {
      User.create({
        id: 1,
        loginId: 'hachi_eiji',
        avatarUrl: 'https://avatars.githubusercontent.com/u/995846?v=3',
        name: 'test'
      }, function (err, user) {
        if (err) {
          return next(err);
        }
        req.session.user = user;
        res.status(200).end();
      });
    }
  });
};
