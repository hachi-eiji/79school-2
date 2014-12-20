'use strict';
var User = require('../models').User;
var config = require('../libs').config;
var https = require('https');
var querystring = require('querystring');

exports.login = function (req, res, next) {
};

exports.create = function (req, res, next) {
};

exports.githubAuthCallback = function (req, res, next) {
  var data = querystring.stringify({
    client_id: config.gitHubAuth.client_id,
    client_secret: config.gitHubAuth.secret,
    code: req.query.code
  });
  var option = {
    hostname: 'github.com',
    port: 443,
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(data),
      'Accept': 'application/json'
    }
  };

  var request = https.request(option, function (authResponse) {
    authResponse.setEncoding('utf-8');

    var responseData = '';
    authResponse.on('data', function (chunk) {
      responseData += chunk;
    });
    authResponse.on('end', function () {
      var token = JSON.parse(responseData).access_token;
      var userRequest = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: '/user',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'token ' + token,
          'User-Agent': 'test'
        }
      }, function (userResponse) {
        userResponse.setEncoding('utf-8');
        var userData = '';
        userResponse.on('data', function (chunk) {
          userData += chunk;
        });
        userResponse.on('end', function () {
          var userObj = JSON.parse(userData);
          User.findOne({id: userObj.id}, function (err, user) {
            if (err) {
              return next(err);
            }
            if (!user) {
              User.create({
                id: userObj.id,
                loginId: userObj.login,
                name: userObj.name,
                avatarUrl: userObj.avatar_url
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
      }).on('error', function (err) {
        console.log(err);
      });
      userRequest.end();
    });
  });
  request.on('error', function (err) {
    console.log(err);
  });
  request.write(data + '\n');
  request.end();
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
