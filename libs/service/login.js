/**
 * @module service/login
 * @file  login
 *
 */
'use strict';
var async = require('async');
var GitHubApi = require('../gitHubApi');
var User = require('../../models').User;

module.exports = LoginFactory;

function LoginFactory() {
}

LoginFactory.Type = {
  GitHub: 0,
  Twitter: 1
};

/**
 * create factory
 * @param {LoginFactory.Type} type
 */
LoginFactory.create = function (type, config) {
  if (type === LoginFactory.Type.GitHub) {
    return new GitHubLogin(config);
  }
  throw new Error('illegal argument error. type is ' + type);
};

/**
 * GitHub Login
 */
function GitHubLogin(config) {
  this.config = config;
}

/**
 * login
 * @param {String} code
 * @param {function} callback
 */
GitHubLogin.prototype.login = function (code, callback) {
  var gitHubApi = new GitHubApi(this.config);
  async.waterfall([

    function (next) {
      gitHubApi.getUser(code, function (err, gitHubUser) {
        if (err) return next(err);
        if (!gitHubUser) return callback(new Error('can not get user'));

        return next(null, gitHubUser);
      });
    },
    function (gitHubUser, next) {
      User.findOne({
        id: gitHubUser.id
      }, function (err, user) {
        if (err) return next(err);
        return next(null, gitHubUser, user);
      });
    },
    function (gitHubUser, user, next) {
      if (user) {
        return next(null, user);
      }
      User.create({
        id: gitHubUser.id,
        loginId: gitHubUser.login + '@github',
        accountType: 'github',
        name: gitHubUser.name,
        avatarUrl: gitHubUser.avatar_url
      }, next);
    }
  ], callback);
};
