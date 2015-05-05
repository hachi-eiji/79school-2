///<reference path="../typings/mongoose/mongoose.d.ts"/>

import mongoose = require('mongoose');
import replyModule = require('replyModule');
import ReplyDocument = replyModule.reply.ReplyDocument;
import ReplyModel = replyModule.reply.ReplyModel;

var schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true,
    index: true
  },
  ownerId: {
    type: Number,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createAt: {
    type: Number,
    default: Date.now
  }
});

schema.static('list', function (limit:number, offset:number, query:Object, callback:(err:any, result:ReplyDocument[])=>void):void {
  this.find(query).populate('owner').sort({createAt: 'desc'}).skip(offset).limit(limit).exec(callback);
});

var model:ReplyModel = <ReplyModel>mongoose.model('Reply', schema);
export = model;
