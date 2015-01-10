/**
 * @module routes/user
 */
'use strict';
var async = require('async');
var User = require('../models').User;
var gitHubApi = require('../libs/gitHubApi');

exports.login = function (req, res, next) {
};

exports.create = function (req, res, next) {
};

exports.gitHubAuthCallback = function (req, res, next) {
  var referer = req.headers['referer'] || '/';
  if (req.session && req.session.user) {
    res.redirect(referer);
  }

  async.waterfall([
    function (callback) {
      gitHubApi.getUser(req.query.code, function (err, gitHubUser) {
        if (!gitHubUser) {
          callback(new Error('can not get user'));
        }
        callback(err, gitHubUser);
      });
    },
    function (gitHubUser, callback) {
      User.findOne({id: gitHubUser.id}, function (err, user) {
        callback(err, gitHubUser, user);
      });
    },
    function (gitHubUser, user, callback) {
      if (user) {
        callback(null, user);
      }
      User.create({
        id: gitHubUser.id,
        loginId: gitHubUser.login,
        name: gitHubUser.name,
        avatarUrl: gitHubUser.avatar_url
      }, function (err, user) {
        callback(err, user);
      });
    }
  ], function (err, user) {
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
