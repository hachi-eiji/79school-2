/**
 * @module service/user
 */
'use strict';
var async = require('async');
var gitHubApi = require('../libs/gitHubApi');

module.exports = {

  logout: function (session, callback) {
    if (session)
      session.destory();
    return callback();
  }
};
