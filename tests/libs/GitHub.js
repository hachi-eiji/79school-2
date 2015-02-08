/* global describe, it, before */
'use strict';

var nock = require('nock');
var GitHubApi = require('../../libs/GitHubApi');
var expect = require('expect.js');



describe('libs/GitHubApi', function() {
  var config = {
    client_id: 'dummy_id',
    secret: 'dummy_secret',
    auth: {
      host: 'localhost',
      port: 3001,
      path: '/auth'
    }
  };
  before(function(done) {
    nock('https://' + config.auth.host + ':' + config.auth.port)
      .log(console.log)
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=valid_code')
      .reply(200, {
        access_token: 'valid_token'
        })
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=invalid_code')
      .reply(400, {
        error: 'error!!'
      })
      ;
    done();
  });

  var tester = new GitHubApi(config);
  describe('_getAccessToken', function() {
    it('should get access token', function(done) {
      tester._getAccessToken('valid_code', function(err, token) {
        if (err) return done(err);
        expect(token).to.eql('valid_token');
        done();
      });
    });

    it('should get error object', function(done){
      tester._getAccessToken('invalid_code', function(err, token) {
        expect(err).not.to.eql(null);
        expect(token).to.eql(undefined);
        done();
      });
    });
  });
});
