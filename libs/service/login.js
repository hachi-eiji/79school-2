/**
 * @module service/login
 * @file  login
 *
 */
'use strict';
const async = require('async');
const GitHubApi = require('../gitHubApi');
const User = require('../../models').User;


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
  const gitHubApi = new GitHubApi(this.config);
  async.waterfall([

    function (next) {
      gitHubApi.getUser(code, (err, gitHubUser) => {
        if (err) return next(err);
        if (!gitHubUser) return callback(new Error('can not get user'));

        return next(null, gitHubUser);
      });
    },
    function (gitHubUser, next) {
      User.findOne({
        id: gitHubUser.id,
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
        avatarUrl: gitHubUser.avatar_url,
      }, next);
    },
  ], callback);
};

function LoginFactory() {
}

LoginFactory.Type = {
  GitHub: 0,
  Twitter: 1,
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

module.exports = LoginFactory;
