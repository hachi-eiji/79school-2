/* global describe, it, before, after, afterEach */
'use strict';

var LoginFactory = require('../../../libs/service/login');

describe('service/login', function () {
  this.timeout(5000);
  before(function () {
  });

  describe('login', function () {
    it('test', function (done) {
      // FIXME create mock
      LoginFactory.create(LoginFactory.Type.GitHub).login('test', function (err, user) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });
});
