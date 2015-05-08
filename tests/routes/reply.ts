///<reference path="../test.default.d.ts"/>
///<reference path="../../typings/express-session/express-session.d.ts"/>
///<reference path="../../typings/superagent/superagent.d.ts"/>

import http = require('http');
import express = require('express');
import async = require('async');
import expect = require('expect.js');
import superagent = require('superagent');
import userModule = require('../../models/userModule');
import UserDocument = userModule.user.UserDocument;
import replyModule = require('../../models/replyModule');
import ReplyDocument = replyModule.reply.ReplyDocument;


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
    var cookie:any;
    var user:UserDocument;
    it('should create reply data', function (done) {
      async.waterfall([
        // ダミーログイン
        function (nextTask:Function) {
          superagent
            .get('http://localhost:' + port + '/debug/login')
            .end(function (res:http.IncomingMessage) {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        // get user object
        function (nextTask:Function) {
          User.findOne({id: 1}, function (err:Error, _user:UserDocument) {
            user = _user;
            nextTask();
          });
        },
        // create replied item
        function (nextTask:Function) {
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
        function (nextTask:Function) {
          var data = {
            body: 'reply body',
            itemId: 'foo'
          };
          superagent
            .post('http://localhost:' + port + '/items/reply')
            .send(data)
            .set('Cookie', cookie)
            .end(function (res:express.Request) {
              nextTask(null, res);
            });
        },
        function (res:express.Request, nextTask:Function) {
          expect(res.statusCode).to.equal(200);
          Reply.find({itemId: 'foo'}, function (err:any, replies:ReplyDocument[]) {
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
      var cookie:any;
      var user:UserDocument;
      async.waterfall([
        // ダミーログイン
        function (nextTask:Function) {
          superagent
            .get('http://localhost:' + port + '/debug/login')
            .end(function (res:express.Request) {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        // get user object
        function (nextTask:Function) {
          User.findOne({id: 1}, function (err:any, _user:UserDocument) {
            user = _user;
            nextTask();
          });
        },
        // create Reply document
        function (nextTask:Function) {
          var data:Object[] = [];
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
        function (nextTask:Function) {
          superagent
            .get('http://localhost:' + port + '/items/reply/list?itemId=item-id')
            .end(function (res:superagent.Response) {
              nextTask(null, res);
            });
        }
        // TODO: waterfall の最後.
      ], function (err:any, res:any) {
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
