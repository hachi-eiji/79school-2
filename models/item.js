'use strict';
var mongoose = require('mongoose');
var async = require('async');

var schema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
    index: {
      unique: true
    }
  },
  ownerId: {
    type: Number,
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    require: true
  },
  body: {
    type: String,
    required: true
  },
  likes: [{type: Number, default: []}],
  published: {
    type: Boolean,
    default: false
  },
  tags: [String],
  searchTags: [String],
  createAt: {
    type: Number,
    default: Date.now
  },
  updateAt: {
    type: Number,
    default: Date.now
  }
});

/**
 * 検索用static method.
 * @param {Object} condition - 検索条件.
 * @param {Number} condition.limit - 取得件数
 * @param {Number} condition.offset 取得開始位置
 * @param {Object} condition.query  取得するための検索条件.
 * @param {Object} condition.sort - ソート条件
 * @param {Function} callback
 */
schema.statics.search = function (condition, callback) {
  condition = condition || {};
  var query = this.find(condition.query || {}).populate('owner');
  if (condition.sort) {
    query = query.sort(condition.sort);
  }
  if (condition.offset) {
    query = query.skip(condition.offset);
  }
  if (condition.limit) {
    query = query.limit(condition.limit);
  }
  query.exec(callback);
};

schema.statics.findItem = function (id, callback) {
  this.findOne({id: id}).populate('owner').exec(callback);
};

/**
 * get timeLine
 * @param {Object} query - 条件
 * @param {Object} sort - ソート条件
 * @param {Number} offset - 開始位置
 * @param {Number} limit - 1ページあたりの表示件数
 * @param {Function} callback - callback function
 */
schema.statics.getTimeLine = function (query, sort, offset, limit, callback) {
  var self = this;
  async.waterfall([
    function (next) {
      var condition = {
        offset: offset || 0,
        limit: limit || 50,
        query: query || {},
        sort: sort || {updateAt: 'desc'}
      };
      self.search(condition, function (err, items) {
        next(err, items);
      });
    }
  ], callback);
};

module.exports = mongoose.model('Item', schema);
