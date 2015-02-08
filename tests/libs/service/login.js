/* global describe, it, before, after, afterEach */
'use strict';

var LoginFactory = require('../../../libs/service/login');
var nock = require('nock');

describe('service/login', function () {
  describe('login', function () {
    before(function (done) {
      nock('https://localhost:3001')
        .log(console.log)
        .post('/login/oauth/access_token', 'client_id=test_client_id&client_secret=test_client_secret&code=test\n')
        .reply(200, {
          access_token: 'test_token'
        })
        .get('/user')
        .reply(200, {
          login: 'test_login',
          id: 1,
          avatar_url: 'http://www.example.com',
          name: 'dummy_user'
        });
      done();
    });
    it('test', function (done) {
      var config = {
        host: 'localhost',
        port: 3001,
        client_id: 'test_client_id',
        secret: 'test_client_secret',
        auth: {
          host: 'localhost',
          port: 3001
        }
      };
      LoginFactory.create(LoginFactory.Type.GitHub, config).login('test', function (err, user) {
        if (err) {
          return done(err);
        }
        return done();
      });
    });
  });
});
