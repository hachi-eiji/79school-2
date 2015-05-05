///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/marked/marked.d.ts"/>

import marked = require('marked');
import crypto = require('crypto');

/**
 * convert from markdown to html
 * @param {String} str -  markdown format string.
 * @return {String} html
 */
export var markdownToHTML = (str:string):string => {
  marked.setOptions({
    gfm: true,
    breaks: true
  });
  return marked(str);
};

/**
 * to md5 from argument values
 * @param {...String} val - to MD5 values
 * @return {String} MD5
 */
export var toMd5 = (...val:string[]):string => {
  if (val.length === 0) {
    return '';
  }
  var str = '';
  var md5 = crypto.createHash('md5');
  for (var i = 0; i < val.length; i++) {
    str += val[i];
  }
  md5.update(str, 'utf8');
  return md5.digest('hex');
};
