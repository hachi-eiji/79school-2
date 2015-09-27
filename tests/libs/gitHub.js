/* global describe, it, before */
'use strict';
var assert = require('power-assert');
var nock = require('nock');
var GitHubApi = require('../../libs/gitHubApi');

describe('libs/GitHubApi', () => {
  const config = {
    client_id: 'dummy_id',
    secret: 'dummy_secret',
    auth: {
      host: 'localhost',
      port: 3001,
      path: '/auth'
    }
  };
  before(function (done) {
    nock(`https://${config.auth.host}:${config.auth.port}`)
      .log(console.log)
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=valid_code')
      .reply(200, { access_token: 'valid_token' })
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=invalid_code')
      .reply(400, { error: 'error!!' });
    done();
  });

  let tester = new GitHubApi(config);
  describe('_getAccessToken', function() {
    it('should get access token', function(done) {
      tester._getAccessToken('valid_code', (err, token) => {
        if (err) return done(err);
        assert.equal(token, 'valid_token');
        done();
      });
    });

    it('should get error object', function (done) {
      tester._getAccessToken('invalid_code', (err, token) => {
        assert.notEqual(err, null);
        assert.equal(token, undefined);
        done();
      });
    });
  });
});
