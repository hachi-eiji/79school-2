/**
 * @module routes/reply
 */
'use strict';
var utils = require('../libs').utils;
// TODO: この記法が正しいのかなぁ...
var toMd5 = utils.toMd5;
var markdownToHTML = utils.markdownToHTML;
var Reply = require('../models').Reply;

exports.register = function (req, res, next) {
  var body = req.body;
  var itemId = body.itemId;
  var time = Date.now();
  var user = req.session.user;

  var id = toMd5(itemId, time);
  var data = {
    id: id,
    itemId: itemId,
    ownerId: user.id,
    owner: user._id,
    body: body.body
  };
  Reply.create(data, function (err, reply) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};

exports.getList = function (req, res, next) {
  var limit = req.query.limit || 10;
  var offset = req.query.offset || 0;
  var query = {
    itemId: req.query.itemId
  };
  Reply.list(limit, offset, query, function (err, replies) {
    if (err) {
      return next(err);
    }
    var data = [];
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
