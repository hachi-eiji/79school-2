'use strict';
exports.item = require('./item');

exports.index = function (req, res, next) {
  res.render('index', {timeLine: getTimeLine()});
};

function getTimeLine() {
  var timeLine = [];
  for (var i = 0; i < 10; i++) {
    var item = {
      id: "id",
      owner: {
        id: 2,
        loginId: "hachi_eiji",
        avatarUrl: "https://avatars.githubusercontent.com/u/995846?v=3"
      },
      title: "俺がmongoだ",
      body: "俺がもんごですよ",
      likeCount: 10,
      tags: ["日報", "ほげ"],
      createdAt: "2014-01-12 00:00:00"
    };
    timeLine.push(item);
  }
  return timeLine;
}
