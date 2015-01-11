'use strict';
var mongoose = require('mongoose');

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

module.exports = mongoose.model('Item', schema);
