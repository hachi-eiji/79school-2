///<reference path="../typings/express-session/express-session.d.ts"/>
import express = require('express');
import session = require('../libs/session');
import userModule = require('../models/userModule');
import UserDocument = userModule.user.UserDocument;

var User = require('../models').User;
var LoginFactory = require('../libs/service/login');
var config = require('../libs/config');

export var logout = function (req:express.Request, res:express.Response, next:Function) {
  req.session.destroy(function (err:any) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

export var gitHubAuthCallback = function (req:express.Request, res:express.Response, next:Function) {
  var referer = req.headers['referer'] || '/';

  var session = <session.ApplicationSession>req.session;
  if (session && session.user) {
    return res.redirect(referer);
  }

  LoginFactory.create(LoginFactory.Type.GitHub, config.gitHubAuth).login(req.query.code, function (err:Error, user:UserDocument) {
    if (err) {
      return next(err);
    }
    (<session.ApplicationSession>req.session).user = {
      _id: user._id,
      id: Number(user.id),
      loginId: user.loginId,
      accountType: 'gitHub',
      name: user.name,
      avatarUrl: user.avatarUrl,
      createAt: user.createAt,
      updateAt: user.updateAt
    };
  })
};

export var debugLogin = function (req:express.Request, res:express.Response, next:Function) {
  User.findOne({id: 1}, function (err:any, user:UserDocument) {
    if (err) {
      return next(err);
    }

    if (user) {
      (<session.ApplicationSession>req.session).user = {
        _id: user._id,
        id: Number(user.id),
        loginId: user.loginId,
        accountType: 'gitHub',
        name: user.name,
        avatarUrl: user.avatarUrl,
        createAt: user.createAt,
        updateAt: user.updateAt
      };
      res.end();
    } else {
      User.create({
        id: 1,
        loginId: 'hachi_eiji',
        avatarUrl: 'https://avatars.githubusercontent.com/u/995846?v=3',
        name: 'test'
      }, function (err:any, user:UserDocument) {
        if (err) {
          return next(err);
        }
        (<session.ApplicationSession>req.session).user = {
          _id: user._id,
          id: Number(user.id),
          loginId: user.loginId,
          accountType: 'gitHub',
          name: user.name,
          avatarUrl: user.avatarUrl,
          createAt: user.createAt,
          updateAt: user.updateAt
        };
        res.end();
      });
    }
  });

};

