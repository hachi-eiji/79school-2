'use strict';
var User = require('../models').User;
var gitHubApi = require('../libs/gitHubApi');

exports.login = function (req, res, next) {
};

exports.create = function (req, res, next) {
};

exports.gitHubAuthCallback = function (req, res, next) {
  gitHubApi.getUser(req.query.code, function (err, gitHubUser) {
    if (err) {
      return next(err);
    }
    if (!gitHubUser) {
      return next(new Error('can not get user'));
    }
    User.findOne({id: gitHubUser.id}, function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        User.create({
          id: gitHubUser.id,
          loginId: gitHubUser.login,
          name: gitHubUser.name,
          avatarUrl: gitHubUser.avatar_url
        }, function (err, user) {
          if (err) {
            return next(err);
          }
          req.session.user = user;
          res.status(200).end();
        });
      } else {
        req.session.user = user;
        res.status(200).end();
      }
    });
  });
};

// 多分本当はわけたほうがいいよね.
exports.debugLogin = function (req, res, next) {
  req.session.user = {
    id: 1
  };
  res.status(200).end();
};

exports.debugCreate = function (req, res, next) {
  User.create({
    id: 1,
    loginId: 'hachi_eiji',
    avatarUrl: 'https://avatars.githubusercontent.com/u/995846?v=3'
  }, function (err, user) {
    if (err) {
      return next(err);
    }
    req.session.user = user;
    res.status(200).end();
  });
};
