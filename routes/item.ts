///<reference path="../typings/express-session/express-session.d.ts"/>

import express = require('express');
import session = require('../libs/session');
import itemModule = require('../models/itemModule');
import ItemDocument = itemModule.item.ItemDocument;

var utils = require('../libs').utils;
var service = require('../libs/service');

/**
 * アイテムを表示する.
 * @param req
 * @param res
 * @param next
 * @public
 */
export var show = function (req:express.Request, res:express.Response, next:any) {
  service.item.getItem(req.params.id, function (err:Error, item:ItemDocument) {
    if (err) {
      return next(err);
    }
    if (!item) {
      return res.status(404).end();
    }
    item.body = utils.markdownToHTML(item.body);
    res.render('item/show', {
      item: item
    });
  });
};

/**
 * 新規登録画面の表示を行う.
 * @param req
 * @param res
 * @param next
 */
export var showCreate = function (req:express.Request, res:express.Response, next:any) {
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
export var register = function (req:express.Request, res:express.Response, next:any) {
  var body = req.body;
  service.item.create((<session.ApplicationSession>req.session).user, body.title, body.body, body.tags, function (err:Error) {
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
export var showEdit = function (req:express.Request, res:express.Response, next:any) {
  service.item.getItem(req.params.id, function (err:Error, item:ItemDocument) {
    if (err) {
      return next(err);
    }
    res.render('item/edit', {
      item: item
    });
  });
};


/**
 * 更新.
 * @param req
 * @param res
 * @param next
 */
export var update = function (req:express.Request, res:express.Response, next:any) {
  var id = req.params.id;
  var body = req.body;

  service.item.update(id, body.title, body.body, body.tags, function (err:Error) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};


/**
 * 記事削除.
 */
export var remove = function (req:express.Request, res:express.Response, next:any) {
  var id = req.params.id;
  service.item.remove(id, function (err:Error) {
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
export var like = function (req:express.Request, res:express.Response, next:any) {
  var userId = (<session.ApplicationSession>req.session).user.id;
  var itemId = req.params.id;
  service.item.like(userId, itemId, function (err:Error) {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
};
