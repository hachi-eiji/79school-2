///<reference path="../../typings/node/node.d.ts"/>
///<reference path="../../typings/async/async.d.ts"/>

import async = require('async');
import loginModule = require('./loginModule');
import LoginConfig = loginModule.LoginConfig;
import LoginType = loginModule.LoginType;
import ILogin = loginModule.ILogin;
import userModule = require('../../models/userModule');

var GitHubApi = require('../gitHubApi');
var User = require('../../models').User;

class LoginFactory {
  constructor() {
  }

  static Type = LoginType;

  static create(loginType:LoginType, config:LoginConfig):ILogin {
    if (loginType === LoginType.GitHub) {
      return new GitHubLogin(config);
    }
    throw new Error('illegal argument error. type is ' + loginType);
  }
}

class GitHubLogin implements ILogin {
  private config:LoginConfig;

  constructor(config:LoginConfig) {
    this.config = config;
  }

  login(code:string, callback:(err:Error, user?:any)=>void) {
    var config = this.config;
    // TODO: config.optionsの設定がよくない.
    var gitHubApi = new GitHubApi(config.client_id, config.secret, config);

    var gitHubUser:any;
    async.waterfall([
      function (next:any) {
        gitHubApi.getUser(code, next);
      },
      function (_gitHubUser:any, next:any) {
        if (!_gitHubUser) {
          return callback(new Error('can not get a user'));
        }
        gitHubUser = _gitHubUser;
        User.findOne({id: gitHubUser.id}, next);
      },
      function (user:userModule.user.UserDocument, next:any) {
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
  }
}

export = LoginFactory;

