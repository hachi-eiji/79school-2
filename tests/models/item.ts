///<reference path="../../typings/mocha/mocha.d.ts"/>
///<reference path="../../typings/expect.js/expect.js.d.ts"/>
///<reference path="../../typings/mongoose/mongoose.d.ts"/>

import mongoose = require('mongoose');
import Model = mongoose.Model;
import Item = require('../../models/item');
import itemInterface = require('../../models/itemInterface');
import ItemModel = itemInterface.item.ItemModel;
import ItemDocument = itemInterface.item.ItemDocument;

describe('model/item', function () {
  before(function (done) {
    mongoose.createConnection(process.env.NODE_MONGO_URL, {safe: true}, function (err:any) {
      if (err) {
        return done(err);
      }
      done();
    })
  });

  describe('base', function () {
    it('insert', function (done) {
      Item.find({id: 'a'}, (err:any, result:ItemDocument[]) => {
        if (err) {
          return done(err);
        }
        console.log(result[0]);
        done();
      });
    });
  });

  describe('static', function () {
    it('search', function (done) {
      Item.findItem('a', (err:any, result:ItemDocument) => {
        if (err) {
          return done(err);
        }
        console.log(result);
        done();
      });
    });
  });
});
