/**
 * @module libs/config
 */
'use strict';
exports.application = {
  port: process.env.PORT || 3000
};
exports.gitHubAuth = {
  client_id: process.env.NODE_GITHUB_CLIENT_ID,
  secret: process.env.NODE_GITHUB_SECRET
};

exports.mongo = {
  url: process.env.NODE_MONGO_URL || 'mongodb://@localhost:27017/test'
};
