/**
 * @module routes/reply
 */
'use strict';
const utils = require('../libs').utils;
const markdownToHTML = utils.markdownToHTML;
const Reply = require('../models').Reply;

exports.register = function (req, res, next) {
  const body = req.body;
  const itemId = body.itemId;
  const time = Date.now();
  const user = req.session.user;

  const id = utils.toMd5(itemId, time);
  const data = {
    id: id,
    itemId: itemId,
    ownerId: user.id,
    owner: user._id,
    body: body.body,
  };
  Reply.create(data, (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};

exports.getList = function (req, res, next) {
  const limit = req.query.limit || 10;
  const offset = req.query.offset || 0;
  const query = {
    itemId: req.query.itemId,
  };
  Reply.list(limit, offset, query, (err, replies) => {
    if (err) {
      return next(err);
    }
    const data = [];
    for (let i = 0; i < replies.length; i++) {
      const reply = replies[i];
      data.push({
        creator: {
          loginId: reply.owner.loginId,
          avatarUrl: reply.owner.avatarUrl,
        },
        body: markdownToHTML(reply.body),
      });
    }
    res.send(data);
  });
};
