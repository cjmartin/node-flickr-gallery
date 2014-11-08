var OAuth = require('oauth').OAuth;

var connection = new OAuth(
	'https://www.flickr.com/services/oauth/device_token',
	'https://www.flickr.com/services/oauth/access_token',
	'',
	'',
	'1.0A',
	null,
	'HMAC-SHA1'
);

exports.get = function(req, method, args, auth, callback) {
	
	var user_token = null,
		user_token_secret = null;

	var argsURL = '';
	for (var key in args) {
		// Don't allow setting keys which have blank values
		if (args[key] !== null && args[key] !== undefined) {
			argsURL += '&' + key + '=' + args[key];
		}
	}
	
	if (auth) {
		user_token = req.user_token || null;
		user_token_secret = req.user_secret || null;
	}

	var apiUrl = 'https://api.flickr.com/services/rest/?method=' + method + argsURL + '&format=json&nojsoncallback=1';

	console.log('[' + req.id + ']', '[api]', 'method=' + method, 'args=' + JSON.stringify(args), 'httpMethod=get', 'url=' + apiUrl);

	connection.get(apiUrl, user_token, user_token_secret, function(error, data, response) {

		if (error) {
			console.log('[' + req.id + ']', '[api]', 'Error calling', method, '- error:', error);
			callback(error, null);

		} else {
			data = JSON.parse(data);

			// One more error check for non-http error Flickr API errors.
			// However, some API errors are handled in the routes, so we can't error on all or them.
			// Only return error on 98, invalid auth token, for now.

			if (data.stat === "fail" && data.code === 98) {
				console.log('[' + req.id + ']', '[api]', 'Error calling', method, '- error:', data);
				callback(data, null);
			} else {
				callback(null, data);
			}
		}
	});
}