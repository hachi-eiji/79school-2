'use strict';
exports.item = require('./item');
exports.user = require('./user');
var Item = require('../models').Item;

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
  offset = offset || 0;
  limit = limit || 50;
  query = query || {};

  Item.search(limit, offset, query, function (err, items) {
    if (err) {
      if (callback) {
        callback(err, []);
      }
    }
    var timeLine = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
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
        createAt: new Date(item.createAt)
      });
    }
    if (callback) {
      callback(null, timeLine);
    }
  });
}
