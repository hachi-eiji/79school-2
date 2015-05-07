///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/async/async.d.ts"/>

import _ = require('lodash');
import async = require('async');
import crypto = require('crypto');
import itemModule = require('../../models/itemModule');
import ItemDocument = itemModule.item.ItemDocument;
import Error = require('../Error');
var dateformat = require('dateformat');
var model = require('../../models');
var Item = model.Item;
var Reply = model.Reply;
var LIMIT_PER_PAGE = 50;

export function getTimeLine(page:number, callback:(err:Error, timeLine?:TimeLine[])=>void):void {
  page = page <= 0 ? 1 : page;
  var limit = LIMIT_PER_PAGE;
  var offset = (page - 1) * limit;
  Item.getTimeLine({}, {
    updateAt: 'desc'
  }, offset, limit, function (err:any, items:ItemDocument[]) {
    if (err) {
      return callback(err);
    }
    var timeLine:TimeLine[] = _.map(items, function (item) {
      return {
        id: item.id,
        owner: {
          id: item.ownerId,
          loginId: item.owner.loginId,
          avatarUrl: item.owner.avatarUrl
        },
        title: item.title,
        body: item.body,
        likeCount: item.likes.length,
        tags: item.tags,
        createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd')
      }
    });
    callback(null, timeLine);
  })
}

export function getItem(id:string, callback:(err?:Error, item?:Item) => void):void {
  Item.findItem(id, function (err:any, item:ItemDocument) {
    if (err) {
      return callback(err);
    }
    if (!item) {
      return callback();
    }
    var data:Item = {
      id: item.id,
      owner: item.owner,
      ownerId: item.ownerId,
      title: item.title,
      body: item.body,
      tags: item.tags,
      createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd'),
      updateAt: dateformat(new Date(item.updateAt), 'yyyy/mm/dd')
    };
    return callback(null, data);
  })
}

export function remove(id:string, callback:(err:Error)=>void):void {
  Item.remove({
    id: id
  }, function (err:Error) {
    if (err) {
      return callback(err);
    }
    Reply.remove({
      itemId: id
    }, callback);
  });
}

export function like(userId:number, id:string, callback:(err:Error, item?:any)=>void):void {
  async.waterfall([

    function (nextTask:any) {
      Item.findItem(id, function (err:any, item:ItemDocument) {
        if (err) {
          return nextTask(err);
        }
        if (!item) {
          var e:Error = new Error('item not found');
          e.status = 404;
          return nextTask(e);
        }
        nextTask();
      });
    },
    function (nextTask:any) {
      Item.update({
        id: id
      }, {
        "$push": {
          likes: userId
        }
      }, nextTask);
    }
  ], callback);
}

export function create(user:any, title:string, body:string, tags:string[], callback:(err:Error, item?:ItemDocument)=>void):void {
  var userId = user.id;
  var time = Date.now();

  var md5 = crypto.createHash('md5');
  md5.update(String(userId) + String(time), 'utf8');
  var id = md5.digest('hex');

  var searchTags:string[] = [];
  for (var i = 0; i < tags.length; i++) {
    searchTags.push(tags[i].toLowerCase());
  }
  var item = {
    id: id,
    ownerId: userId,
    owner: user._id,
    title: title,
    body: body,
    tags: tags,
    searchTags: searchTags
  };
  Item.create(item, callback);
}
export function update(id:string, title:string, body:string, tags:string[], callback:(err:Error, item?:ItemDocument)=>void):void {
  var searchTags:string[] = [];
  for (var i = 0; i < tags.length; i++) {
    searchTags.push(tags[i].toLowerCase());
  }
  var data = {
    title: title,
    body: body,
    tags: tags,
    searchTags: searchTags,
    updateAt: Date.now()
  };
  Item.update({
    id: id
  }, data, callback);
}

export interface TimeLine {
  id:string;
  owner:{
    id:number;
    loginId:string;
    avatarUrl: string;
  };
  title:string;
  body: string;
  likeCount: number;
  tags: string[];
  createAt: string;
}
export interface Item {
  id:string;
  owner: any;
  ownerId:number;
  title:string;
  body: string;
  tags: string[];
  createAt: string;
  updateAt: string;
}
