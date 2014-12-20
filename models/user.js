'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    index: {
      unique: true
    }
  },
  loginId:{
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  avatarUrl : String,
  createAt: {
    type: Number,
    default: Date.now()
  },
  updateAt: {
    type: Number,
    default: Date.now()
  }
});

module.exports = mongoose.model('User', schema);
