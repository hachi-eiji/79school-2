/* global describe, it, before, after, afterEach */
'use strict';
const assert = require('power-assert');
const co = require('co');
const app = require('../../app');
const startup = app.startup;
const shutdown = app.shutdown;

const superAgentPromise = require('../util').superAgentPromise;

const model = require('../../models/index');
const Item = model.Item;
const User = model.User;
const Reply = model.Reply;

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
          searchTags: ['a', 'b'],
        });
        const data = {
          body: 'reply body',
          itemId: 'foo',
        };
        res = yield superAgentPromise('/items/reply', 'POST', data, new Map([['Cookie', cookie]]));
        assert(res.statusCode, 200);
        return yield Reply.find({ itemId: 'foo' }).exec();
      }).then((replies) => {
        const reply = replies[0];
        assert.equal(reply.itemId, 'foo');
        assert.equal(reply.ownerId, user.id);
        assert.equal(reply.body, 'reply body');
        done();
      }).catch((err) => done(err));
    });
  });

  describe('getList', function () {
    it('should get item list', function (done) {
      let user;
      co(function* () {
        user = yield User.findOne({ id: 1 }).exec();
        // create Reply document
        const data = [];
        for (let i = 0; i < 10; i++) {
          const time = new Date(2014, i, 1).getTime();
          data.push({
            id: 'foo-' + i,
            itemId: 'item-id',
            ownerId: user.id,
            owner: user._id,
            body: 'item body - ' + i,
            createAt: time,
            updateAt: time,
          });
        }
        yield Reply.create(data);
        return yield superAgentPromise('/items/reply/list?itemId=item-id');
      }).then((res) => {
        assert.equal(res.body.length, 10);
        for (let i = 0; i < res.body.length; i++) {
          const reply = res.body[i];
          assert.equal(reply.body, `<p>item body - ${Number(res.body.length - (i + 1))}</p>\n`);
        }
        done();
      }).catch((err) => done(err));
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
