'use strict';
var appConfig = require('./config');
var https = require('https');
var querystring = require('querystring');

/**
 * get user via GitHub API.
 * @param {String} code - code
 * @param {Function} cb - callback method
 */
exports.getUser = function (code, cb) {
  this.getAccessToken(code, function (err, accessToken) {
    if (err) {
      if (cb) {
        cb(err, null);
      }
    }
    getUser(accessToken, cb);
  });
};

/**
 * get access token via GitHub.
 *
 * @param {String} code - code from GitHub request
 * @param {Function} cb - callback method
 * @public
 */
exports.getAccessToken = function (code, cb) {
  if (!code) {
    var error = new Error('code is undefined');
    if (cb) {
      cb(error, null);
    }
  }
  var data = querystring.stringify({
    client_id: appConfig.gitHubAuth.client_id,
    client_secret: appConfig.gitHubAuth.secret,
    code: code
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
  var req = https.request(option, function (res) {
    res.setEncoding('utf-8');
    if (res.statusCode >= 400) {
      cb(new Error('status code is ' + res.statusCode));
    }
    var responseData = '';
    res.on('data', function (chunk) {
      responseData += chunk;
    });
    res.on('end', function () {
      if (cb) {
        var json = JSON.parse(responseData);
        if (!json.error) {
          cb(null, json.access_token);
        } else {
          cb(new Error(json.error));
        }
      }
    });
  });
  req.on('error', function (err) {
    if (cb) {
      cb(err, null);
    }
  });
  req.write(data + '\n');
  req.end();
};


/**
 * get user via GitHub API.
 *
 * @param {String} accessToken - access_token
 * @param {Function} cb - callback method
 * @private
 */
function getUser(accessToken, cb) {
  var req = https.request({
    hostname: 'api.github.com',
    port: 443,
    path: '/user',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'token ' + accessToken,
      'User-Agent': 'test'
    }
  }, function (res) {
    res.setEncoding('utf-8');
    var statusCode = res.statusCode;
    var userData = '';
    res.on('data', function (chunk) {
      userData += chunk;
    });
    res.on('end', function () {
      if (cb) {
        var json = JSON.parse(userData);
        if (statusCode >= 400) {
          cb(new Error(json.message));
        } else {
          cb(null, json);
        }
      }
    });
  }).on('error', function (err) {
    if (cb) {
      cb(err, null);
    }
  });
  req.end();
}
