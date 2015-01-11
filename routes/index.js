/**
 * @module routes
 */
'use strict';
exports.item = require('./item');
exports.user = require('./user');
exports.reply = require('./reply');
var Item = require('../models').Item;
var dateformat = require('dateformat');
var async = require('async');
var _ = require('lodash');

exports.index = function (req, res, next) {
  getTimeLine(50, 0, {}, function (err, timeLine) {
    if (err) {
      return next(err);
    }
    res.render('index', {timeLine: timeLine});
  });
};


/**
 * データを取得.
 * @param {Number} limit  取得する件数
 * @param {Number} offset 取得開始位置
 * @param {Object} query  取得するための検索条件.
 * @param {Function} callback
 */
function getTimeLine(limit, offset, query, callback) {
  async.waterfall([
    function (next) {
      var condition = {
        offset: offset || 0,
        limit: limit || 50,
        query: query || {},
        sort: {updateAt: 'desc'}
      };
      Item.search(condition, function (err, items) {
        next(err, items);
      });
    }
  ], function (err, items) {
    if (err) {
      callback(err, []);
    }
    var timeLine = [];
    _.forEach(items, function (item) {
      timeLine.push({
        id: item.id,
        owner: {
          id: item.ownerId,
          loginId: item.owner.loginId,
          avatarUrl: item.owner.avatarUrl
        },
        title: item.title,
        body: item.body,
        likeCount: item.likes.length,
        tags: item.tags,
        createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd')
      });
    });
    callback(null, timeLine);
  });
}
