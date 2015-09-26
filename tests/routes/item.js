/* global describe, it, before, after, afterEach */
'use strict';
var co = require('co');
var expect = require('expect.js');
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
        expect(res.status).to.equal(200);
        // mongooseはpromiseを返却する query#execを参照.
        return yield Item.find({ ownerId: 1 }).populate('owner').exec();
      }).then(items => {
        // check registered item data
        var item = items[0];
        expect(item.ownerId).to.equal(1);
        expect(item.title).to.equal('title');
        expect(item.body).to.equal('body');
        expect(item.tags).to.have.length(3);
        expect(item.tags).to.contain('Ab');
        expect(item.tags).to.contain('b');
        expect(item.tags).to.contain('テスト');
        expect(item.searchTags).to.have.length(3);
        expect(item.searchTags).to.contain('ab');
        expect(item.searchTags).to.contain('b');
        expect(item.searchTags).to.contain('テスト');
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
        expect(res.statusCode).to.equal(200);
        var text = res.text;
        expect(text).to.be.contain('test title');
        expect(text).to.be.contain('<span class="label label-default">foo</span><span class="label label-default">bar</span>');
        expect(text).to.be.contain(`${user.loginId}が2014/12/01に投稿`);
        expect(text).to.be.contain('<div class="panel-body"><p>test body</p>\n</div>');
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
        expect(item.title).to.equal('updated title');
        expect(item.body).to.equal('updated body');
        expect(item.tags).to.have.length(2);
        expect(item.tags).to.contain('updated1');
        expect(item.tags).to.contain('updated2');
        expect(item.searchTags).to.have.length(2);
        expect(item.searchTags).to.contain('updated1');
        expect(item.searchTags).to.contain('updated2');
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
          expect(e.response.statusCode).to.equal(404);
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
        expect(res.status).to.equal(200);
        return yield Item.findItem(1);
      }).then(item => {
        expect(item.likes).to.contain(1);
        expect(item.likes).have.length(1);
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
          expect(e.response.statusCode).to.equal(403);
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
