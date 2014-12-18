'use strict';
var Item = require('../models').Item;
var crypto = require('crypto');

/**
 * アイテムを表示する.
 * @param req
 * @param res
 * @param next
 * @public
 */
exports.show = function (req, res, next) {
  // NOP
};


/**
 * 新規登録画面の表示を行う.
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = function (req, res, next) {
  // NOP
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
  var item = {
    id: id,
    ownerId: userId,
    title: body.title,
    body: body.body,
    tags: body.tags
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
