'use strict';
var NodeCache = require('node-cache');

var appCache = new NodeCache();
var appCacheGet = function appCacheGet(key) {
  return appCache.get(key)[key]
}

var codeset = 'omyg5dNIF81Uiws4hzeKPBJX9lack72bj0xvqyrOMYGDRW6SHZnfu3ELACVQY';
var base = codeset.length;

var encode = function encode(id) {
  var id = parseInt(id, 10);
  if (isNaN(id)) {
    return null;
  }
  if (appCacheGet("to_"+id)) {
    return appCacheGet("to_"+id);
  }

  var position;
  var encoded = '';
  var iter_id = id;

  while (iter_id > 0) {
    position = iter_id % base;
    encoded = [codeset[position], encoded].join('');
    iter_id = Math.floor(iter_id / base);
  }
  appCache.set("to_"+id, encoded);
  return encoded;
}

var decode = function decode(encoded) {
  if (appCacheGet("from_"+encoded)) {
    return appCacheGet("from_"+encoded);
  }

  var id = 0;

  for (var i = encoded.length; i > 0; i--) {
    id += codeset.search(encoded[i-1])*Math.pow(base, encoded.length-i);
  }

  appCache.set("from_"+encoded, id);
  return id;
}

module.exports = {
  encode: encode,
  decode: decode
}
