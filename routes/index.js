/**
 * @module routes
 */
'use strict';
exports.item = require('./item');
exports.user = require('./user');
exports.reply = require('./reply');
var Item = require('../models').Item;

exports.index = function (req, res, next) {
  Item.getTimeLine({}, {updateAt: 'desc'}, 0, 50, function (err, timeLine) {
    if (err) {
      return next(err);
    }
    res.render('index', {timeLine: timeLine});
  });
};
