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
    default: Date.now()
  },
  updateAt: {
    type: Number,
    default: Date.now()
  }
});

/**
 * 検索用static method.
 * @param {Number} limit  取得する件数
 * @param {Number} offset 取得開始位置
 * @param {Object} query  取得するための検索条件.
 * @param {Function} callback
 */
schema.statics.search = function (limit, offset, query, callback) {
  this.find(query).populate('owner').sort({updateAt: 'desc'}).skip(offset).limit(limit).exec(callback);
};

module.exports = mongoose.model('Item', schema);
