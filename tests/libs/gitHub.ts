///<reference path="../../typings/mocha/mocha.d.ts"/>
///<reference path="../../typings/expect.js/expect.js.d.ts"/>
///<reference path="../../typings/nock/nock.d.ts"/>

import nock = require('nock');
import expect = require('expect.js');
import GitHubApi = require('../../libs/gitHubApi');

describe('lib/GitHubApi', function () {
  // TODO: 型指定できないので、interfaceとかで指定してあげるといい
  var config = {
    host: 'localhost',
    port: 3001,
    auth: {
      host: 'localhost',
      port: 3001,
      path: '/auth',
      method: 'POST'
    },
    user: {
      path: '/user',
      method: 'GET',
    }
  };

  before(function (done) {
    nock('https://' + config.auth.host + ':' + config.auth.port)
      .log(console.log)
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=valid_code')
      .reply(200, {
        access_token: 'valid_token'
      })
      .post(config.auth.path, 'client_id=dummy_id&client_secret=dummy_secret&code=invalid_code')
      .reply(400, {
        error: 'error!!'
      });
    done();
  });

  var tester = new GitHubApi('dummy_id', 'dummy_secret', config);
  describe('_getAccessToken', function () {
    it('should get access token', function (done) {
      tester._getAccessToken('valid_code', function (err:Error, token:string) {
        if (err) return done(err);
        expect(token).to.eql('valid_token');
        done();
      });
    });

    it('should get error object', function (done) {
      tester._getAccessToken('invalid_code', function (err:Error, token:string) {
        expect(err).not.to.eql(null);
        expect(token).to.eql(undefined);
        done();
      });
    });
  });

});
