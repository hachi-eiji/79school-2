///<reference path="../typings/node/node.d.ts"/>

var config = {
  application: {
    port: process.env.PORT || 3000
  },
  gitHubAuth: {
    client_id: process.env.NODE_GITHUB_CLIENT_ID,
    secret: process.env.NODE_GITHUB_SECRET
  },
  mongo: {
    url: process.env.NODE_MONGO_URL || 'mongodb://@localhost:27017/test'
  }
};
export = config;

