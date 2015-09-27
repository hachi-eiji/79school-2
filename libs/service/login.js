/**
 * @module service/login
 * @file  login
 *
 */
'use strict';
const async = require('async');
const co = require('co');
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
  const getGitHubUserPromise = new Promise((resolve, reject) => {
    gitHubApi.getUser(code, (err, gitHubUser) => {
      if (err) return reject(err);
      if (!gitHubUser) return reject(new Error('can not get user'));
      resolve(gitHubUser);
    });
  });

  co(function* () {
    const gitHubUser = yield getGitHubUserPromise;
    const user = yield User.findOne({ id: gitHubUser.id });
    if (!user) {
      yield User.create({
        id: gitHubUser.id,
        loginId: gitHubUser.login + '@github',
        accountType: 'github',
        name: gitHubUser.name,
        avatarUrl: gitHubUser.avatar_url,
      });
    }
    return user;
  }).then((user) => callback(null, user))
    .catch((err) => callback(err));
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
