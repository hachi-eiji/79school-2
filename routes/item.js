/**
 * @module routes/item
 */
'use strict';
const utils = require('../libs').utils;
const service = require('../libs/service');

/**
 * アイテムを表示する.
 * @param req
 * @param res
 * @param next
 * @public
 */
exports.show = function(req, res, next) {
  service.item.getItem(req.params.id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (!item) {
      return res.status(404).end();
    }
    item.body = utils.markdownToHTML(item.body);
    res.render('item/show', {
      item: item,
    });
  });
};


/**
 * 新規登録画面の表示を行う.
 * @param req
 * @param res
 * @param next
 */
exports.showCreate = function (req, res) {
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
exports.register = function(req, res, next) {
  const body = req.body;
  service.item.create(req.session.user, body.title, body.body, body.tags, (err) => {
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
exports.showEdit = function(req, res, next) {
  service.item.getItem(req.params.id, (err, item) => {
    if (err) {
      return next(err);
    }
    res.render('item/edit', {
      item: item,
    });
  });
};


/**
 * 更新.
 * @param req
 * @param res
 * @param next
 */
exports.update = function(req, res, next) {
  const id = req.params.id;
  const body = req.body;

  service.item.update(id, body.title, body.body, body.tags, (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};


/**
 * 記事削除.
 */
exports.remove = function(req, res, next) {
  const id = req.params.id;
  service.item.remove(id, (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};

/**
 * likeする.
 * @param req
 * @param res
 * @param next
 */
exports.like = function(req, res, next) {
  const userId = req.session.user.id;
  const itemId = req.params.id;

  service.item.like(userId, itemId, (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};
