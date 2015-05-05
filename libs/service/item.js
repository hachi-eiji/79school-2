///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/async/async.d.ts"/>
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var dateformat = require('dateformat');
var model = require('../../models');
var Item = model.Item;
var Reply = model.Reply;
var LIMIT_PER_PAGE = 50;
function getTineLine(page, callback) {
    page = page <= 0 ? 1 : page;
    var limit = LIMIT_PER_PAGE;
    var offset = (page - 1) * limit;
    Item.getTimeLine({}, {
        updateAt: 'desc'
    }, offset, limit, function (err, items) {
        if (err) {
            return callback(err);
        }
        var timeLine = _.map(items, function (item) {
            return {
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
            };
        });
        callback(null, timeLine);
    });
}
exports.getTineLine = getTineLine;
function getItem(id, callback) {
    Item.findItem(id, function (err, item) {
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
}
exports.getItem = getItem;
function remove(id, callback) {
    Item.remove({
        id: id
    }, function (err) {
        if (err) {
            return callback(err);
        }
        Reply.remove({
            itemId: id
        }, callback);
    });
}
exports.remove = remove;
function like(userId, id, callback) {
    async.waterfall([
        function (nextTask) {
            Item.findItem(id, function (err, item) {
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
        function (nextTask) {
            Item.update({
                id: id
            }, {
                "$push": {
                    likes: userId
                }
            }, nextTask);
        }
    ], callback);
}
exports.like = like;
function create(user, title, body, tags, callback) {
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
}
exports.create = create;
function update(id, title, body, tags, callback) {
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
exports.update = update;
//# sourceMappingURL=item.js.map