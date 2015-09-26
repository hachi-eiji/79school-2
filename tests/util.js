'use strict';

var superagent = require('superagent');
var app = require('../app');
var port = app.port;

exports.superAgentPromise = function (path, method, data, headers) {
  method = method || 'GET';
  data = data || null;
  headers = headers || new Map();
  return new Promise((resolve, reject) => {
    let s;
    switch (method) {
      case 'GET':
        s = superagent.get(`http://localhost:${port}${path}`);
        break;
      case 'POST':
        s = superagent.post(`http://localhost:${port}${path}`);
        break;
      default :
        s = superagent.get(`http://localhost:${port}${path}`);
        break;
    }
    if (data) {
      s = s.send(data);
    }
    let itr = headers.entries();
    let v;
    while ((v = itr.next().value)) {
      s = s.set(v[0], v[1]);
    }
    s.end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};
