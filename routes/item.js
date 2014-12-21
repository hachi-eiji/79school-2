'use strict';
var Item = require('../models').Item;
var crypto = require('crypto');
var marked = require('marked');
var dateformat = require('dateformat');

/**
 * アイテムを表示する.
 * @param req
 * @param res
 * @param next
 * @public
 */
exports.show = function (req, res, next) {
  getItem(req.params.id, function (err, item) {
    if (err) {
      return next(err);
    }
    if (!item) {
      return res.status(404).end();
    }
    res.render('item/show', {item: item});
  });
};


/**
 * 新規登録画面の表示を行う.
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = function (req, res, next) {
  res.render('item/new');
};

/**
 * アイテム登録.
 * リクエストデータはJSON文字列で渡ってくる.
 *
 * @param req
 * @param res
 * @param next
 */
exports.register = function (req, res, next) {
  var userId = req.session.user.id;
  var time = Date.now();

  var md5 = crypto.createHash('md5');
  md5.update(String(userId) + String(time), 'utf8');
  var id = md5.digest('hex');

  var body = req.body;
  var tags = body.tags || [];

  var searchTags = [];
  for (var i = 0; i < tags.length; i++) {
    searchTags.push(tags[i].toLowerCase());
  }

  var item = {
    id: id,
    ownerId: userId,
    owner: req.session.user._id,
    title: body.title,
    body: body.body,
    tags: tags,
    searchTags: searchTags
  };

  Item.create(item, function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};

/**
 * 編集画面表示
 * @param req
 * @param res
 * @param next
 */
exports.showEdit = function (req, res, next) {

};


/**
 * 更新.
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {

};


function getItem(id, cb) {
  Item.findItem(id, function (err, item) {
    if (err) {
      cb(err);
    }
    if (!item) {
      cb(null, null);
    }
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    var data = {
      id: item.id,
      owner: item.owner,
      ownerId: item.ownerId,
      title: item.title,
      body: marked(item.body),
      tags: item.tags,
      createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd'),
      updateAt: dateformat(new Date(item.updateAt), 'yyyy/mm/dd')
    };
    cb(null, data);
  });
}
