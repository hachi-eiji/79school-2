'use strict';
var marked = require('marked');

/**
 * convert from markdown to html
 * @param {String} str -  markdown format string.
 * @return {String} html
 */
exports.markdownToHTML = function (str) {
  marked.setOptions({
    gfm: true,
    breaks: true
  });
  return marked(str);
};
