'use strict';
const _ = require('lodash');
const co = require('co');
const crypto = require('crypto');
const dateformat = require('dateformat');
const Item = require('../../models').Item;
const Reply = require('../../models').Reply;

const LIMIT_PER_PAGE = 50;

module.exports = {
  /**
   * get item time line.
   * @param {number} [page=1]    - page number
   * @param {Function} callback  - callback function
   */
  getTimeLine: function(page, callback) {
    page = !page || page <= 0 ? 1 : page;
    const limit = LIMIT_PER_PAGE;
    const offset = (page - 1) * limit;

    co(function* () {
      const items = yield Item.getTimeLine({}, { updateAt: 'desc' }, offset, limit);
      const timeLine = [];
      _.forEach(items, (item) => {
        timeLine.push({
          id: item.id,
          owner: {
            id: item.ownerId,
            loginId: item.owner.loginId,
            avatarUrl: item.owner.avatarUrl,
          },
          title: item.title,
          body: item.body,
          likeCount: item.likes.length,
          tags: item.tags,
          createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd'),
        });
      });
      return timeLine;
    }).then((timeLine) => callback(null, timeLine))
      .catch((err) => callback(err));
  },

  /**
   * find one item
   * @param {string} id - item id
   */
  getItem: function(id, callback) {
    co(function* () {
      const item = yield Item.findItem(id);
      return {
        id: item.id,
        owner: item.owner,
        ownerId: item.ownerId,
        title: item.title,
        body: item.body,
        tags: item.tags,
        createAt: dateformat(new Date(item.createAt), 'yyyy/mm/dd'),
        updateAt: dateformat(new Date(item.updateAt), 'yyyy/mm/dd'),
      };
    }).then((item) => callback(null, item))
      .catch((err) => callback(err));
  },

  /**
   * remove item
   * @param {string} id - remove item
   */
  remove: function(id, callback) {
    co(function* () {
      yield Item.remove({ id });
      return yield Reply.remove({ itemId: id });
    }).then((result) => callback(null, result))
      .catch((err) => callback(err));
  },

  /**
   * like
   * @param {number} userId     - user id
   * @param {string} id         - item id
   * @param {Function} callback - callback function
   */
  like: function(userId, id, callback) {
    co(function* () {
      const item = yield Item.findItem(id);
      if (!item) {
        const _err = new Error('item not found');
        _err.status = 404;
        throw _err;
      }
      yield Item.update({ id }, { '$push': { likes: userId } });
    }).then(() => callback())
      .catch((err) => callback(err));
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
    const userId = user.id;
    const time = Date.now();

    const md5 = crypto.createHash('md5');
    md5.update(String(userId) + String(time), 'utf8');
    const id = md5.digest('hex');

    const searchTags = [];
    for (let i = 0; i < tags.length; i++) {
      searchTags.push(tags[i].toLowerCase());
    }
    const item = {
      id,
      ownerId: userId,
      owner: user._id,
      title,
      body,
      tags,
      searchTags,
    };
    Item.create(item, callback);
  },
  update: function(id, title, body, tags, callback) {
    tags = tags || [];
    const searchTags = [];
    for (let i = 0; i < tags.length; i++) {
      searchTags.push(tags[i].toLowerCase());
    }
    const data = {
      title,
      body,
      tags,
      searchTags,
      updateAt: Date.now(),
    };
    Item.update({ id }, data, callback);
  },
};
