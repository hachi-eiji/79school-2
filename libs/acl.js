/**
 * @module libs/acl
 */
'use strict';
const models = require('../models');

/**
 * 自分のアイテムか?
 *
 * @param req
 * @param res
 * @param next
 */
exports.myItem = function (req, res, next) {
  models.Item.findOne({ id: req.params.id }, (err, item) => {
    if (err) {
      return next(err);
    }

    const user = req.session.user;
    if (user && item.ownerId === user.id) {
      return next();
    }
    const e = new Error('could not get item');
    e.status = 403;
    return next(e);
  });
};

exports.login = function (req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  const e = new Error('not login');
  e.status = 403;
  return next(e);
};
