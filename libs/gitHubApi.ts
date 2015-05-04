///<reference path="../typings/node/node.d.ts"/>

import https = require('https');
import http = require('http');
import querystring = require('querystring');

/**
 * GitHubAPI configuration
 */
export interface GitHubApiConfig {
  clientId:string;
  secret: string;
  host:string;
  port:number;
  auth: {
    host:string;
    port:number;
    path:string;
    method:string;
  };
  user: {
    path:string;
    method:string;
  }
}

export interface GitHubApiConfigOption {
  host:string;
  port:number;
  auth: {
    host:string;
    port:number;
    path:string;
    method:string;
  };
  user: {
    path:string;
    method:string;
  }
}

export class GitHubApi {
  private config:GitHubApiConfig;

  constructor(clientId:string, secret:string, option?:GitHubApiConfigOption) {
    this.config = {
      clientId: clientId,
      secret: secret,
      host: option ? option.host : 'api.github.com',
      port: option ? option.port : 443,
      auth: option ? option.auth : {host: 'github.com', port: 443, path: '/login/oauth/access_token', method: 'POST'},
      user: option ? option.user : {path: '/user', method: 'GET'}
    };
  }

  /**
   * get user via GitHub API.
   * @param {string} code - code
   * @param {Function} callback - callback method
   */
  getUser(code:string, callback:(err:Error, accessToken?:string)=>void):void {
    var self = this;
    self._getAccessToken(code, function (err, accessToken) {
      if (err) {
        return callback(err);
      }
      self._getUser(accessToken, callback);
    });
  }

  /**
   * get access token.
   *
   * @param {string} code - code
   * @param {Function} callback - callback method
   */
  _getAccessToken(code:string, callback:(err:Error, accessToken?:string)=>void):void {
    if (!code) {
      var error = new Error('code is undefined');
      return callback(error);
    }

    var config = this.config;
    var data = querystring.stringify({
      client_id: config.clientId,
      client_secret: config.secret,
      code: code
    });

    var option = {
      hostname: config.auth.host,
      port: config.auth.port,
      path: config.auth.path,
      method: config.auth.method,
      headers: {
        'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/json'
      }
    };
    var req = https.request(option, function (res:http.IncomingMessage) {
      res.setEncoding('utf-8');
      if (res.statusCode >= 400) {
        return callback(new Error('status code is ' + res.statusCode));
      }
      var responseData = '';
      res.on('data', function (chunk:string) {
        responseData += chunk;
      });
      res.on('end', function () {
        try {
          var json = JSON.parse(responseData);
          if (json.error) {
            return callback(new Error(json.error));
          }
          return callback(null, json.access_token);
        } catch (e) {
          return callback(new Error('json parse error.' + responseData));
        }
      });
    });

    req.on('error', function (err:Error) {
      return callback(err);
    });
    req.write(data + '\n');
    req.end();
  }

  _getUser(accessToken:string, callback:(err:Error, user?:Object) => void):void {
    var config = this.config;
    var req = https.request({
      hostname: config.host,
      port: config.port,
      path: config.user.path,
      method: config.user.method,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'token ' + accessToken,
        'User-Agent': 'test'
      }
    }, function (res:http.IncomingMessage) {
      res.setEncoding('utf-8');
      var statusCode = res.statusCode;
      var userData = '';
      res.on('data', function (chunk:string) {
        userData += chunk;
      });
      res.on('end', function () {
        var json = JSON.parse(userData);
        if (statusCode >= 400) {
          return callback(new Error(json.message));
        }
        return callback(null, json);
      });
    });
    req.on('error', function (err:Error) {
      return callback(err);
    });
    req.end();
  }
}
