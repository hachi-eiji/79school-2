///<reference path="../typings/express-session/express-session.d.ts"/>

import express = require('express');
import session = require('../libs/session');
import replyModule = require('../models/replyModule');
import ReplyDocument = replyModule.reply.ReplyDocument;

var utils = require('../libs').utils;
var markdownToHTML = utils.markdownToHTML;
var Reply = require('../models').Reply;

export var register = function (req:express.Request, res:express.Response, next:Function) {
  var body = req.body;
  var itemId = body.itemId;
  var time = Date.now();
  var user = (<session.ApplicationSession>req.session).user;

  var id = utils.toMd5(itemId, time);
  var data = {
    id: id,
    itemId: itemId,
    ownerId: user.id,
    owner: user._id,
    body: body.body
  };
  Reply.create(data, function (err:Error, reply:ReplyDocument) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};

export var getList = function (req:express.Request, res:express.Response, next:Function) {
  var limit = req.query.limit || 10;
  var offset = req.query.offset || 0;
  var query = {
    itemId: req.query.itemId
  };
  Reply.list(limit, offset, query, function (err:Error, replies:ReplyDocument[]) {
    if (err) {
      return next(err);
    }
    var data:IReplayContent[] = [];
    for (var i = 0; i < replies.length; i++) {
      var reply = replies[i];
      data.push({
        creator: {
          loginId: reply.owner.loginId,
          avatarUrl: reply.owner.avatarUrl
        },
        body: markdownToHTML(reply.body)
      });
    }
    res.send(data);
  });
};

export interface IReplayContent {
  body:string;
  creator: {
    loginId: string;
    avatarUrl: string;
  }
}
