import Error = require('Error')
import express = require('express');
import session = require('session');
import itemModule = require('../models/itemModule');
import ItemDocument = itemModule.item.ItemDocument;

var models = require('../models');

export var myItem = (req:express.Request, res:express.Response, next:any):void => {
  models.Item.findOne({id: req.params.id}, (err:any, item:ItemDocument):void => {
    if (err) {
      return next(err);
    }
    var session:session.ApplicationSession = req.session;
    var user:session.User = session.user;

    if (user && item.ownerId === user.id) {
      return next();
    }
    var e:Error = new Error('could not get item');
    e.status = 403;
    return next(e);
  })
};

export var login = (req:express.Request, res:express.Response, next:any):void => {
  var session:session.ApplicationSession = req.session;
  if (session && session.user) {
    return next();
  }
  var e:Error = new Error('could not get item');
  e.status = 403;
  return next(e);
};
