'use strict';
var User = require('../models').User;

exports.login = function (req, res, next) {

};

exports.create = function (req, res, next) {

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
