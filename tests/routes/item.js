/* global describe, it, before, after, afterEach */
'use strict';
var co = require('co');
var assert = require('power-assert');
var app = require('../../app');
var startup = app.startup;
var shutdown = app.shutdown;

var superAgentPromise = require('../util').superAgentPromise;
var Item = require('../../models/index').Item;
var User = require('../../models/index').User;

describe('item', function () {
  this.timeout(5000);
  before(function () {
    startup();
  });

  describe('register', function () {
    let cookie;
    it('should create item object', function (done) {
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        const data = {
          title: 'title',
          body: 'body',
          tags: ['Ab', 'b', 'テスト']
        };
        res = yield superAgentPromise('/items/create', 'POST', data, new Map([['Cookie', cookie]]));
        assert.equal(res.status, 200);
        // mongooseはpromiseを返却する query#execを参照.
        return yield Item.find({ ownerId: 1 }).populate('owner').exec();
      }).then(items => {
        // check registered item data
        var item = items[0];
        assert.equal(item.ownerId, 1);
        assert.equal(item.title, 'title');
        assert.equal(item.body, 'body');
        assert.equal(item.tags.length, 3);
        assert(item.tags.indexOf('Ab') !== -1);
        assert(item.tags.indexOf('b') !== -1);
        assert(item.tags.indexOf('テスト') !== -1);
        assert.equal(item.searchTags.length, 3);
        assert(item.searchTags.indexOf('ab') !== -1);
        assert(item.searchTags.indexOf('b') !== -1);
        assert(item.searchTags.indexOf('テスト') !== -1);
        done();
      }).catch(err => done(err));
    });
  });

  describe('get', function () {
    it('should get item object', function (done) {
      const createAt = new Date(2014, 11, 1).getTime();
      const updateAt = new Date(2014, 11, 2).getTime();
      co(function* () {
        const user = yield User.findOne({ id: 1 }).exec();
        let item = {
          id: '1',
          ownerId: 1,
          owner: user._id,
          title: 'test title',
          body: 'test body',
          tags: ['foo', 'bar'],
          searchTags: ['foo', 'bar'],
          createAt,
          updateAt,
        };
        yield Item.create(item);
        const res = yield superAgentPromise('/items/1');
        assert.equal(res.statusCode, 200);
        var text = res.text;

        assert(text.indexOf('test title') !== -1);
        assert(text.indexOf('<span class="label label-default">foo</span><span class="label label-default">bar</span>') !== -1);
        assert(text.indexOf(`${user.loginId}が2014/12/01に投稿`) !== -1);
        assert(text.indexOf('<div class="panel-body"><p>test body</p>\n</div>') !== -1);
        done();
      }).catch(err => done(err));
    });
  });

  describe('edit', function () {
    let cookie;
    it('should update item', function (done) {
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        let user = yield User.findOne({ id: 1 }).exec();
        const item = {
          id: '1',
          ownerId: 1,
          owner: user._id,
          title: 'test title',
          body: 'test body',
          tags: ['foo', 'bar'],
          searchTags: ['foo', 'bar'],
          createAt: Date.now(),
          updateAt: Date.now()
        };
        yield Item.create(item);
        const updated = {
          title: 'updated title',
          body: 'updated body',
          tags: ['updated1', 'updated2']
        };
        res = yield superAgentPromise('/items/1/edit', 'POST', updated, new Map([['Cookie', cookie]]));
        // 更新内容がDBに反映されているか
        return yield Item.findOne({ id: '1' }).exec();
      }).then(item => {
        assert.equal(item.title, 'updated title');
        assert.equal(item.body, 'updated body');
        assert.equal(item.tags.length, 2);
        assert(item.tags.indexOf('updated1') !== -1);
        assert(item.tags.indexOf('updated2') !== -1);
        assert.equal(item.searchTags.length, 2);
        assert(item.searchTags.indexOf('updated1') !== -1);
        assert(item.searchTags.indexOf('updated2') !== -1);
        done();
      }).catch(err => done(err));
    });
  });

  describe('like request ', function () {
    it('should reposed 404 status when user like to no exists item', function (done) {
      let cookie;
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        try {
          // エラーが発生した時はrejectを呼び出しているので,catchにいく.また戻りはない.
          yield superAgentPromise('/items/1/like', 'POST', null, new Map([['Cookie', cookie]]));
        } catch (e) {
          assert.equal(e.response.statusCode, 404);
        }
        done();
      }).catch(err => done(err));
    });
    it('should create like on item collection', function (done) {
      let cookie;
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        let user = yield User.findOne({ id: 1 }).exec();
        let item = {
          id: '1',
          ownerId: 1,
          owner: user._id,
          title: 'test title',
          body: 'test body',
          tags: ['foo', 'bar'],
          searchTags: ['foo', 'bar'],
          createAt: Date.now(),
          updateAt: Date.now()
        };
        yield Item.create(item);
        res = yield superAgentPromise('/items/1/like', 'POST', null, new Map([['Cookie', cookie]]));
        assert.equal(res.status, 200);

        return yield Item.findItem(1);
      }).then(item => {
        assert(item.likes.indexOf(1) !== -1);
        assert.equal(item.likes.length, 1);
        done();
      }).catch(err => done(err));
    });

    it('anonymous user should not like', function (done) {
      let cookie;
      co(function* () {
        let res = yield superAgentPromise('/debug/login');
        cookie = res.headers['set-cookie'][0];
        let user = yield User.findOne({ id: 1 }).exec();
        const item = {
          id: '1',
          ownerId: 1,
          owner: user._id,
          title: 'test title',
          body: 'test body',
          tags: ['foo', 'bar'],
          searchTags: ['foo', 'bar'],
          createAt: Date.now(),
          updateAt: Date.now()
        };
        yield Item.create(item);
        try {
          yield superAgentPromise('/items/1/like', 'POST');
        } catch (e) {
          assert.equal(e.response.statusCode, 403);
        }
        done();
      }).catch(err => done(err));
    });
  });

  afterEach(function() {
    Item.remove({}, function() {});
  });

  after(function() {
    shutdown();
  });
});
