///<reference path="../typings/node/node.d.ts"/>
module lib {
  export var config = require('./config');
  export var gitHubApi = require('./gitHubApi');
  export var acl = require('./acl');
  export var utils = require('./utils');
}
export = lib;
