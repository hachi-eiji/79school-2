///<reference path="../typings/mongoose/mongoose.d.ts"/>

import mongoose = require('mongoose');
import userModule = require('./userModule');
import UserDocument = userModule.user.UserDocument;
import UserModel = userModule.user.UserModel;

var schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    index: {
      unique: true
    }
  },
  loginId: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  accountType: {
    type: String,
    enum: 'github twitter'.split(' ')
  },
  name: {
    type: String,
    required: true
  },
  avatarUrl: String,
  createAt: {
    type: Number,
    default: Date.now
  },
  updateAt: {
    type: Number,
    default: Date.now
  }
});

var model:UserModel = <UserModel>mongoose.model<UserDocument>('User', schema);
export = model;
