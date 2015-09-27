/**
 * @module libs/utils
 */
'use strict';
const marked = require('marked');
const crypto = require('crypto');

/**
 * convert from markdown to html
 * @param {String} str -  markdown format string.
 * @return {String} html
 */
exports.markdownToHTML = function (str) {
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
  return marked(str);
};


/**
 * to md5 from argument values
 * @return {String} MD5
 */
exports.toMd5 = function () {
  if (arguments.length === 0) {
    return '';
  }
  let str = '';
  const md5 = crypto.createHash('md5');
  for (let i = 0; i < arguments.length; i++) {
    str += String(arguments[i]);
  }
  md5.update(str, 'utf8');
  return md5.digest('hex');
};
