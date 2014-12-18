'use strict';
var Item = require("../models").Item;

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
 * @param req
 * @param res
 * @param next
 */
exports.register = function (req, res, next) {
  Item.find({}, function (err, items) {
    console.log("hoge");
  });
  var item = {
    id: "hoge",
    ownerId: 11,
    title: "a",
    body: "b",
    tags: ["ab", "b"]
  };

  Item.create(item, function (err, item) {
    if (err) {
      return next(err);
    }
    res.send({hoge: "fuga"});
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
