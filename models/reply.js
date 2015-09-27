'use strict';
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
    index: true,
  },
  ownerId: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  createAt: {
    type: Number,
    default: Date.now,
  },
});

schema.statics.list = function (limit, offset, query, callback) {
  this.find(query).populate('owner').sort({createAt: 'desc'}).skip(offset).limit(limit).exec(callback);
};

module.exports = mongoose.model('Reply', schema);
