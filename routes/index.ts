///<reference path="../typings/express/express.d.ts"/>
import express = require('express');
import itemModule = require('../models/itemModule');
import ItemDocument = itemModule.item.ItemDocument;

export var item = require('./item');
export var user = require('./user');
export var reply = require('./reply');
var service = require('../libs/service');

export var index = function (req:express.Request, res:express.Response, next:any) {
  service.item.getTimeLine(1, function (err:Error, timeLine:ItemDocument[]) {
    if (err) {
      return next(err);
    }
    res.render('index', {timeLine: timeLine});
  });
};
