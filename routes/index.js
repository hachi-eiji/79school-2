/**
 * @module routes
 */
'use strict';
exports.item = require('./item');
exports.user = require('./user');
exports.reply = require('./reply');
var service = require('../libs/service');

exports.index = function (req, res, next) {
  service.item.getTimeLine(1, function (err, timeLine) {
    if (err) {
      return next(err);
    }
    res.render('index', {timeLine: timeLine});
  });
};
