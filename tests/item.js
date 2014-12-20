'use strict';
var expect = require('expect.js');
var superagent = require('superagent');
var app = require('../app');
var port = app.port;
var startup = app.startup;
var shutdown = app.shutdown;

var Item = require('../models').Item;

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
          expect(res.status).to.eql(200);
          Item.find({ownerId: 1}).populate('owner').exec(function (err, items) {
            var item = items[0];
            expect(item.ownerId).to.eql(1);
            expect(item.title).to.eql('title');
            expect(item.body).to.eql('body');
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

  afterEach(function () {
    Item.remove({}, function (err) {
    });
  });

  after(function () {
    shutdown();
  });
});
