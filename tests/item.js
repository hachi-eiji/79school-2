'use strict';
var expect = require('expect.js');
var superagent = require('superagent');
var app = require('../app');
var port = app.port;
var startup = app.startup;
var shutdown = app.shutdown;

var Item = require('../models').Item;
var User = require('../models').User

describe('server', function () {
  this.timeout(5000);
  before(function () {
    startup();
  });

  describe('item register', function () {
    var cookie;
    it('login debug user', function (done) {
      superagent
        .get('http://localhost:' + port + '/debug/login')
        .end(function (res) {
          cookie = res.headers['set-cookie'][0];
          done();
        });
    });
    it('should create item object', function (done) {
      var data = {
        title: 'title',
        body: 'body',
        tags: ['Ab', 'b', 'テスト']
      };
      superagent
        .post('http://localhost:' + port + '/items/create')
        .send(data)
        .set('Cookie', cookie)
        .end(function (res) {
          expect(res.status).to.equal(200);
          Item.find({ownerId: 1}).populate('owner').exec(function (err, items) {
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
  });

  describe('get item', function () {
    it('should get item object', function (done) {
      var createAt = new Date(2014, 11, 1);
      var updateAt = new Date(2014, 11, 2);
      User.findOne({id: 1}, function (err, user) {
        var item = {
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
        Item.create(item, function (err, item) {
          superagent
            .get('http://localhost:' + port + '/items/1')
            .end(function (res) {
              expect(res.statusCode).to.equal(200);
              var text = res.text;
              expect(text).to.be.contain('<div class="panel-title">test title</div>');
              expect(text).to.be.contain('<span class="label label-default">foo</span><span class="label label-default">bar</span>');
              expect(text).to.be.contain(user.loginId + 'が2014/12/01に投稿');
              expect(text).to.be.contain('<div class="panel-body"><p>test body</p>\n</div>');
              done();
            });
        });
      });
    });
  });

  describe('edit item', function () {
    it('should update item', function (done) {
      User.findOne({id: 1}, function (err, user) {
        var item = {
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
        Item.create(item, function (err, item) {
          var updated = {
            title: 'updated title',
            body: 'updated body',
            tags: ['updated1', 'updated2']
          };
          superagent
            .post('http://localhost:' + port + '/items/1/edit')
            .send(updated)
            .end(function (res) {
              expect(res.statusCode).to.equal(200);
              Item.findOne({id: '1'}, function (err, item) {
                expect(err).to.be.equal(null);
                expect(item.title).to.be.equal('updated title');
                expect(item.body).to.be.equal('updated body');
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
      });
    });
  });

  afterEach(function () {
    Item.remove({}, function (err) {
    });
  });

  after(function () {
    shutdown();
  });
});
