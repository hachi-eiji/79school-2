'use strict';
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var dateformat = require('dateformat');
var Item = require('../../models').Item;
var Reply = require('../../models').Reply;

var LIMIT_PER_PAGE = 50;

module.exports = {
  /**
   * get item time line.
   * @param {number} [page=1]    - page number
   * @param {Function} callback  - callback function
   */
  getTimeLine: function(page, callback) {
    page = !page || page <= 0 ? 1 : page;
    var limit = LIMIT_PER_PAGE;
    var offset = (page - 1) * limit;
    Item.getTimeLine({}, {
      updateAt: 'desc'
    }, offset, limit, function(err, items) {
      if (err) {
        callback(err);
      }
      var timeLine = [];
      _.forEach(items, function(item) {
        timeLine.push({
          id: item.id,
          owner: {
            id: item.ownerId,
            loginId: item.owner.loginId,
            avatarUrl: item.owner.avatarUrl
          },
          title: item.title,
          body: item.body,
          likeCount: item.likes.length,
          tags: item.tags,
          createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd')
        });
      });
      callback(null, timeLine);
    });
  },

  /**
   * find one item
   * @param {string} id - item id
   */
  getItem: function(id, callback) {
    Item.findItem(id, function(err, item) {
      if (err) {
        return callback(err);
      }
      if (!item) {
        return callback();
      }
      var data = {
        id: item.id,
        owner: item.owner,
        ownerId: item.ownerId,
        title: item.title,
        body: item.body,
        tags: item.tags,
        createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd'),
        updateAt: dateformat(new Date(item.updateAt), 'yyyy/mm/dd')
      };
      return callback(null, data);
    });
  },

  /**
   * remove item
   * @param {string} id - remove item
   */
  remove: function(id, callback) {
    Item.remove({
      id: id
    }, function(err) {
      if (err) {
        return callback(err);
      }
      Reply.remove({
        itemId: id
      }, callback);
    });
  },

  /**
   * like
   * @param {number} userId     - user id
   * @param {string} id         - item id
   * @param {Function} callback - callback function
   */
  like: function(userId, id, callback) {
    async.waterfall([

      function(nextTask) {
        Item.findItem(id, function(err, item) {
          if (err) {
            return nextTask(err);
          }
          if (!item) {
            var e = new Error('item not found');
            e.status = 404;
            return nextTask(e);
          }
          nextTask();
        });
      },
      function(nextTask) {
        Item.update({
          id: id
        }, {
          "$push": {
            likes: userId
          }
        }, nextTask);
      }
    ], callback);
  },

  /**
   * create item
   * @param {Object} user
   * @param {string} title
   * @param {string} body
   * @param {string[]} tags
   * @param {Function} callback
   */
  create: function(user, title, body, tags, callback) {
    tags = tags || [];
    var userId = user.id;
    var time = Date.now();

    var md5 = crypto.createHash('md5');
    md5.update(String(userId) + String(time), 'utf8');
    var id = md5.digest('hex');

    var searchTags = [];
    for (var i = 0; i < tags.length; i++) {
      searchTags.push(tags[i].toLowerCase());
    }
    var item = {
      id: id,
      ownerId: userId,
      owner: user._id,
      title: title,
      body: body,
      tags: tags,
      searchTags: searchTags
    };
    Item.create(item, callback);
  },
  update: function(id, title, body, tags, callback) {
    tags = tags || [];
    var searchTags = [];
    for (var i = 0; i < tags.length; i++) {
      searchTags.push(tags[i].toLowerCase());
    }
    var data = {
      title: title,
      body: body,
      tags: tags,
      searchTags: searchTags,
      updateAt: Date.now()
    };
    Item.update({
      id: id
    }, data, callback);
  }
};
