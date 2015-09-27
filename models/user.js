'use strict';

const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    index: {
      unique: true,
    },
  },
  loginId: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  accountType: {
    type: String,
    enum: 'github twitter'.split(' '),
  },
  name: {
    type: String,
    required: true,
  },
  avatarUrl: String,
  createAt: {
    type: Number,
    default: Date.now,
  },
  updateAt: {
    type: Number,
    default: Date.now,
  },
});
module.exports = mongoose.model('User', schema);
