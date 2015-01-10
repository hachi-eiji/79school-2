/**
 * @module libs/acl
 */
'use strict';
var models = require('../models');

/**
 * 自分のアイテムか?
 *
 * @param req
 * @param res
 * @param next
 */
exports.myItem = function (req, res, next) {
  models.Item.findOne({id: req.params.id}, function (err, item) {
    if (err) {
      return next(err);
    }

    var user = req.session.user;
    if (user && item.ownerId === user.id) {
      return next();
    }
    var e = new Error('could not get item');
    e.status = 403;
    return next(e);
  });
};
