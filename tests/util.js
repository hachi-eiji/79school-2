'use strict';

const superagent = require('superagent');
const app = require('../app');
const port = app.port;

exports.superAgentPromise = function (path, method, data, headers) {
  method = method || 'GET';
  data = data || null;
  headers = headers || new Map();
  return new Promise((resolve, reject) => {
    let agent;
    switch (method) {
      case 'GET':
        agent = superagent.get(`http://localhost:${port}${path}`);
        break;
      case 'POST':
        agent = superagent.post(`http://localhost:${port}${path}`);
        break;
      default :
        agent = superagent.get(`http://localhost:${port}${path}`);
        break;
    }
    if (data) {
      agent = agent.send(data);
    }
    const itr = headers.entries();
    let val;
    while ((val = itr.next().value)) {
      agent = agent.set(val[0], val[1]);
    }
    agent.end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};
