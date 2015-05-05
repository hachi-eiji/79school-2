///<reference path="../typings/mongoose/mongoose.d.ts"/>
///<reference path="../typings/async/async.d.ts"/>

import mongoose = require('mongoose');
import Schema = mongoose.Schema;
import Query = mongoose.Query;
import async = require('async');
import itemInterface = require('./itemInterface');
import ItemDocument = itemInterface.item.ItemDocument;
import ItemModel = itemInterface.item.ItemModel;
import ItemSearchCondition = itemInterface.item.ItemSearchCondition;

var schema:Schema = new Schema({
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
    //required: true
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

schema.static('search', function (condition?:ItemSearchCondition, callback?:(err:any, result:ItemDocument[])=>void) {
  var query:Query<ItemDocument> = this.find(condition.query || {}).populate('owner');
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
});

schema.static('findItem', function (id:string, callback:(err:any, result:ItemDocument)=>void) {
  this.findOne({id: id}).populate('owner').exec(callback);
});

schema.static('getTimeLine', (query = {}, sort = {updateAt: 'desc'}, offset = 0, limit = 50, callback?:(err:any, result:ItemDocument[])=>void) => {
  async.waterfall([
    function (next:any) {
      var condition = {
        offset: offset,
        limit: limit,
        query: query,
        sort: sort
      };
      this.search(condition, next);
    }
  ], callback);
});

var model:ItemModel = <ItemModel>mongoose.model<ItemDocument>('Item', schema);
export = model;
