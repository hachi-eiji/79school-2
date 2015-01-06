/* global describe, it, before, after, afterEach */
'use strict';
var async = require('async');
var expect = require('expect.js');
var superagent = require('superagent');
var app = require('../../app');
var port = app.port;
var startup = app.startup;
var shutdown = app.shutdown;

var model = require('../../models/index');
var Item = model.Item;
var User = model.User;
var Reply = model.Reply;

describe('reply', function () {
  this.timeout(5000);
  before(function () {
    startup();
  });

  describe('register', function () {
    var cookie;
    var user;
    it('should create reply data', function (done) {
      async.waterfall([
        // ダミーログイン
        function (nextTask) {
          superagent
            .get('http://localhost:' + port + '/debug/login')
            .end(function (res) {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        // get user object
        function (nextTask) {
          User.findOne({id: 1}, function (err, _user) {
            user = _user;
            nextTask();
          });
        },
        // create replied item
        function (nextTask) {
          Item.create({
            id: 'foo',
            ownerId: user.id,
            owner: user._id,
            title: 'title',
            body: 'body',
            tags: ['a', 'b'],
            searchTags: ['a', 'b']
          }, function () {
            nextTask();
          });
        },
        function (nextTask) {
          var data = {
            body: 'reply body',
            itemId: 'foo'
          };
          superagent
            .post('http://localhost:' + port + '/items/reply')
            .send(data)
            .set('Cookie', cookie)
            .end(function (res) {
              nextTask(null, res);
            });
        },
        function (res, nextTask) {
          expect(res.statusCode).to.equal(200);
          Reply.find({itemId: 'foo'}, function (err, replies) {
            nextTask(err, replies);
          });
        }
      ], function (err, replies) {
        var reply = replies[0];
        expect(reply.itemId).to.equal('foo');
        expect(reply.ownerId).to.equal(user.id);
        expect(reply.body).to.equal('reply body');
        done();
      });
    });
  });

  describe('getList', function () {
    it('should get item list', function (done) {
      var cookie;
      var user;
      async.waterfall([
        // ダミーログイン
        function (nextTask) {
          superagent
            .get('http://localhost:' + port + '/debug/login')
            .end(function (res) {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        // get user object
        function (nextTask) {
          User.findOne({id: 1}, function (err, _user) {
            user = _user;
            nextTask();
          });
        },
        // create Reply document
        function (nextTask) {
          var data = [];
          for (var i = 0; i < 10; i++) {
            var time = new Date(2014, i, 1).getTime();
            data.push({
              id: 'foo-' + i,
              itemId: 'item-id',
              ownerId: user.id,
              owner: user._id,
              body: 'item body - ' + i,
              createAt: time,
              updateAt: time
            });
          }
          Reply.create(data, function () {
            nextTask();
          });
        },
        // test
        function (nextTask) {
          superagent
            .get('http://localhost:' + port + '/items/reply/list?itemId=item-id')
            .end(function (res) {
              nextTask(null, res);
            });
        }
      ], function (err, res) {
        expect(res.body).to.have.length(10);
        for (var i = 0; i < res.body.length; i++) {
          var reply = res.body[i];
          expect(reply.body).to.equal('<p>item body - ' + Number(res.body.length - (i + 1)) + '</p>\n');
        }
        done();
      });
    });
  });

  afterEach(function () {
    Item.remove({}, function () {
    });
    Reply.remove({}, function () {
    });
  });

  after(function () {
    shutdown();
  });
});
