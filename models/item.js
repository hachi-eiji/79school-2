'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {
    type: String,
    require: true
  },
  ownerId: {
    type: Number,
    require: true
  },
  title: {
    type: String,
    require: true
  },
  body: {
    type: String,
    require: true
  },
  likes: [{type: Number, default: []}],
  published: {
    type: Boolean,
    default: false
  },
  tags: [String]
});

module.exports = mongoose.model('Item', schema);
