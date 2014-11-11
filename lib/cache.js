var Memcached = require('memcached');

/**
 * The memcached host 
 */
var host = 'localhost:11211';

console.log('Memcached connecting to %s', host);

/**
 * The memcached store.
 */
var store = new Memcached(host);

/**
 * Retrieve a value from the cache by `key`.
 */
exports.get = function(key, callback) {
  store.get(key, callback);
};

/**
 * Put a value in the cache by `key`.
 */
exports.set = function(key, value, ttl, callback){
  store.set(key, value, ttl, callback);
};
