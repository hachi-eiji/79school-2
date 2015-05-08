///<reference path="../test.default.d.ts"/>

import expect = require('expect.js');
import async = require('async');
import mongoose = require('mongoose');
import Model = mongoose.Model;
import Item = require('../../models/item');
import itemModule = require('../../models/itemModule');
import ItemModel = itemModule.item.ItemModel;
import ItemDocument = itemModule.item.ItemDocument;

describe('model/item', function () {
  this.timeout(5000);
  before(function (done) {
    mongoose.createConnection(process.env.NODE_MONGO_URL);
    done();
  });

  describe('base method', function () {
    it('create and find', function (done) {
      var doc = {
        id: 'a',
        ownerId: 1,
        title: 'test',
        body: 'test body'
      };
      async.waterfall([
        function (next:any) {
          Item.create(doc, next);
        },
        function (item:ItemDocument, next:any) {
          expect(item.title).to.eql('test');
          expect(item.body).to.eql('test body');
          next()
        },
        function (next:any) {
          Item.find({ownerId: 1}).populate('owner').exec(next);
        },
        function (items:ItemDocument[], next:any) {
          expect(items[0].title).to.eql('test');
          next();
        }
      ], done);
    });
  });

  describe('static method', function () {
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

  afterEach(function (done) {
    Item.remove({}, done);
  });
});
