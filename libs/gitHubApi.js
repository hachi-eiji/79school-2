/**
 * @file GitHub API
 */
'use strict';
const https = require('https');
const querystring = require('querystring');


function GitHubApi(config) {
  this.config = config || {};
  this.config.host = this.config.host || 'api.github.com';
  this.config.port = this.config.port || 443;

  this.config.auth = this.config.auth || {};
  this.config.auth.host = this.config.auth.host || 'github.com';
  this.config.auth.port = this.config.auth.port || 443;
}

module.exports = GitHubApi;

/**
 * get user via GitHub API.
 * @param {string} code - code
 * @param {Function} callback - callback method
 */
GitHubApi.prototype.getUser = function (code, callback) {
  this._getAccessToken(code, (err, accessToken) => {
    if (err) {
      return callback(err);
    }
    return this._getUser(accessToken, callback);
  });
};

/**
 * get access token.
 *
 * @param {string} code - code
 * @param {Function} callback - callback method
 */
GitHubApi.prototype._getAccessToken = function (code, callback) {
  if (!code) {
    const error = new Error('code is undefined');
    return callback(error);
  }

  const config = this.config;
  const data = querystring.stringify({
    client_id: config.client_id,
    client_secret: config.secret,
    code: code,
  });

  const option = {
    hostname: config.auth.host,
    port: config.auth.port,
    path: (config.auth && config.auth.path) || '/login/oauth/access_token',
    method: (config.auth && config.auth.method) || 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(data),
      'Accept': 'application/json',
    },
  };
  const req = https.request(option, function (res) {
    res.setEncoding('utf-8');
    if (res.statusCode >= 400) {
      return callback(new Error('status code is ' + res.statusCode));
    }
    let responseData = '';
    res.on('data', function (chunk) {
      responseData += chunk;
    });
    res.on('end', function () {
      try {
        const json = JSON.parse(responseData);
        if (json.error) {
          return callback(new Error(json.error));
        }
        return callback(null, json.access_token);
      } catch (e) {
        return callback(new Error('json parse error. ' + responseData));
      }
    });
  });
  req.on('error', function (err) {
    return callback(err, null);
  });
  req.write(data + '\n');
  req.end();
};

/**
 * request to GitHub
 * @param {string} accessToken - access token
 * @param {Function} callback - callback
 */
GitHubApi.prototype._getUser = function (accessToken, callback) {
  const config = this.config;
  const req = https.request({
    hostname: config.host,
    port: config.port,
    path: (config.user && config.user.path) || '/user',
    method: (config.user && config.user.method) || 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'token ' + accessToken,
      'User-Agent': 'test',
    },
  }, function (res) {
    res.setEncoding('utf-8');
    const statusCode = res.statusCode;
    let userData = '';
    res.on('data', function (chunk) {
      userData += chunk;
    });
    res.on('end', function () {
      const json = JSON.parse(userData);
      if (statusCode >= 400) {
        return callback(new Error(json.message));
      }
      return callback(null, json);
    });
  }).on('error', function (err) {
    return callback(err, null);
  });
  req.end();
};
