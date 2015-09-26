/* global describe, it, before, after, afterEach */
'use strict';
var async = require('async');
var expect = require('expect.js');
var superagent = require('superagent');
var app = require('../../app');
var port = app.port;
var startup = app.startup;
var shutdown = app.shutdown;

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
      async.waterfall([
        // ダミーログイン
        (nextTask) => {
          superagent
            .get(`http://localhost:${port}/debug/login`)
            .end((err, res) => {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        (nextTask) => {
          let data = {
            title: 'title',
            body: 'body',
            tags: ['Ab', 'b', 'テスト']
          };
          superagent
            .post(`http://localhost:${port}/items/create`)
            .send(data)
            .set('Cookie', cookie)
            .end((err, res) => nextTask(null, res));
        },
        (res, nextTask) => {
          expect(res.status).to.equal(200);
          nextTask();
        },
        (nextTask) => {
          // APIで作成したアイテムがDBに入っているか
          Item.find({ ownerId: 1 }).populate('owner').exec((err, items) => nextTask(null, items));
        }
      ], (err, items) => {
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
      });
    });
  });

  describe('get', function () {
    it('should get item object', function (done) {
      const createAt = new Date(2014, 11, 1);
      const updateAt = new Date(2014, 11, 2);
      async.waterfall([
        (nextTask) => User.findOne({ id: 1 }, (err, user) => nextTask(null, user)),
        (user, nextTask) => {
          let item = {
            id: '1',
            ownerId: 1,
            owner: user._id,
            title: 'test title',
            body: 'test body',
            tags: ['foo', 'bar'],
            searchTags: ['foo', 'bar'],
            createAt: createAt.getTime(),
            updateAt: updateAt.getTime()
          };
          Item.create(item, () => nextTask(null, user));
        },
        // 1行で終わるけど、こういうところは{}をつけたほうが見やすい.
        (user, nextTask) => {
          superagent
            .get(`http://localhost:${port}/items/1`)
            .end((err, res) => nextTask(null, user, res));
        }
      ], (err, user, res) => {
        expect(res.statusCode).to.equal(200);
        var text = res.text;
        expect(text).to.be.contain('test title');
        expect(text).to.be.contain('<span class="label label-default">foo</span><span class="label label-default">bar</span>');
        expect(text).to.be.contain(`${user.loginId}が2014/12/01に投稿`);
        expect(text).to.be.contain('<div class="panel-body"><p>test body</p>\n</div>');
        done();
      });
    });
  });

  describe('edit', function () {
    let cookie;
    it('should update item', function (done) {
      async.waterfall([
        // ダミーログイン
        (nextTask) => {
          superagent
            .get(`http://localhost:${port}/debug/login`)
            .end((err, res) => {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        (nextTask) =>  User.findOne({ id: 1 }, (err, user) => nextTask(null, user)),
        // テストの記事作成
        (user, nextTask) => {
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
          Item.create(item, () => nextTask());
        },
        (nextTask) => {
          const updated = {
            title: 'updated title',
            body: 'updated body',
            tags: ['updated1', 'updated2']
          };
          superagent
            .post(`http://localhost:${port}/items/1/edit`)
            .send(updated)
            .set('Cookie', cookie)
            .end((err, res) => nextTask(null, res));
        },
        // 更新処理がDBに反映されているか.
        (res, nextTask) => {
          Item.findOne({ id: '1' }, (err, item) => nextTask(err, item));
        }
      ], (err, item) => {
        expect(err).to.be.equal(null);
        expect(item.title).to.equal('updated title');
        expect(item.body).to.equal('updated body');
        expect(item.tags).to.have.length(2);
        expect(item.tags).to.contain('updated1');
        expect(item.tags).to.contain('updated2');
        expect(item.searchTags).to.have.length(2);
        expect(item.searchTags).to.contain('updated1');
        expect(item.searchTags).to.contain('updated2');
        done();
      });
    });
  });

  describe('like request ', function () {
    it('should reposed 404 status when user like to no exists item', function (done) {
      let cookie;
      async.waterfall([
        // create dummy data
        (nextTask) => {
          superagent
            .get(`http://localhost:${port}/debug/login`)
            .end((err, res) => {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        function (nextTask) {
          superagent
            .post(`http://localhost:${port}/items/1/like`)
            .set('Cookie', cookie)
            .end((err, res) => nextTask(err, res));
        }
      ], (err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
    it('should create like on item collection', function (done) {
      let cookie;
      async.waterfall([
        // create dummy data
        (nextTask) => {
          superagent
            .get(`http://localhost:${port}/debug/login`)
            .end((err, res) => {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        (nextTask) => User.findOne({ id: 1 }, nextTask),
        (user, nextTask) => {
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
          Item.create(item, () => nextTask(null));
        },
        (nextTask) => {
          superagent
            .post(`http://localhost:${port}/items/1/like`)
            .set('Cookie', cookie)
            .end((err, res) => nextTask(err, res));
        },
        function (res, nextTask) {
          expect(res.status).to.equal(200);
          Item.findItem(1, (err, item) => nextTask(err, item));
        }
      ], (err, item) => {
        if (err) return done(err);
        expect(item.likes).to.contain(1);
        expect(item.likes).have.length(1);
        done();
      });
    });

    it('anonymous user should not like', function (done) {
      let cookie;
      async.waterfall([
        // create dummy data
        (nextTask) => {
          superagent
            .get('http://localhost:' + port + '/debug/login')
            .end(function (err, res) {
              cookie = res.headers['set-cookie'][0];
              nextTask();
            });
        },
        (nextTask) => User.findOne({ id: 1 }, (err, user) => nextTask(err, user)),
        (user, nextTask) => {
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
          Item.create(item, () => nextTask(null));
        },
        (nextTask) => {
          // anonymous user
          superagent
            .post(`http://localhost:${port}/items/1/like`)
            .end((err, res) => nextTask(err, res));
        }
      ], (err, res) => {
        expect(res.status).to.equal(403);
        done();
      });
    });
  });

  afterEach(function() {
    Item.remove({}, function() {});
  });

  after(function() {
    shutdown();
  });
});
