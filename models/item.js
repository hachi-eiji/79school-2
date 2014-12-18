'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {
    type: String,
    require: true
  },
  ownerId: {
    type: Number,
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

module.exports = mongoose.model('Item', schema);
