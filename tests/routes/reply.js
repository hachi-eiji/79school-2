/* global describe, it, before, after, afterEach */
'use strict';
var co = require('co');
var expect = require('expect.js');
var superagent = require('superagent');
var app = require('../../app');
var port = app.port;
var startup = app.startup;
var shutdown = app.shutdown;

var superAgentPromise = require('../util').superAgentPromise;

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
    let cookie;
    let user;
    it('should create reply data', function (done) {
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        user = yield User.findOne({ id: 1 }).exec();
        yield Item.create({
          id: 'foo',
          ownerId: user.id,
          owner: user._id,
          title: 'title',
          body: 'body',
          tags: ['a', 'b'],
          searchTags: ['a', 'b']
        });
        const data = {
          body: 'reply body',
          itemId: 'foo'
        };
        res = yield superAgentPromise('/items/reply', 'POST', data, new Map([['Cookie', cookie]]));
        expect(res.statusCode).to.equal(200);
        return yield Reply.find({ itemId: 'foo' }).exec();
      }).then(replies => {
        var reply = replies[0];
        expect(reply.itemId).to.equal('foo');
        expect(reply.ownerId).to.equal(user.id);
        expect(reply.body).to.equal('reply body');
        done();
      }).catch(err => done(err));
    });
  });

  describe('getList', function () {
    it('should get item list', function (done) {
      let cookie;
      let user;
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        user = yield User.findOne({ id: 1 }).exec();
        // create Reply document
        let data = [];
        for (var i = 0; i < 10; i++) {
          let time = new Date(2014, i, 1).getTime();
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
        yield Reply.create(data);
        return yield superAgentPromise('/items/reply/list?itemId=item-id');
      }).then(res => {
        expect(res.body).to.have.length(10);
        for (var i = 0; i < res.body.length; i++) {
          var reply = res.body[i];
          expect(reply.body).to.equal(`<p>item body - ${Number(res.body.length - (i + 1))}</p>\n`);
        }
        done();
      }).catch(err => done(err));
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
