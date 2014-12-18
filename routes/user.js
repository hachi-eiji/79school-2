'use strict';

exports.login = function (req, res, next) {

};

exports.debugLogin = function (req, res, next) {
  req.session.user = {
    id: 1
  };
  res.status(200).end();
};

