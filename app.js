var _ = require('underscore'),
	express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    exphbs = require('express-handlebars'),
    slug = require('slug'),
    hbsHelpers = require('./lib/hbs-helpers'),
    flickrAPI = require('./lib/flickr-api'),
	utils = require('./lib/utilities'),
	cache = require('./lib/cache');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'main', helpers: hbsHelpers}));
app.set('view engine', '.hbs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    var id;
    if (typeof req.id === 'undefined') {
        id = crypto.randomBytes(16).toString('hex');
        req.id = id.substring(0,8);
    }
    next();
});

// We always need the photosets in memcache, since we're using slugs in urls and need a lookup.
// So, if they're stale, re-fetch them, otherwise pull from cache and attach to the req.
app.use(function(req, res, next) {
	var apiCall = {
		method: 'flickr.photosets.getList',
		auth: false,
		params: {
			user_id: '43813659@N03',
			primary_photo_extras: 'url_q,url_n,url_z,url_l,url_h,url_k'
		}
	};

	var cacheTime = 60*60; // 1 Hour cache. 
	var cacheKey = 'photosets_' + crypto.createHash('md5').update("GET" + apiCall.method + JSON.stringify(apiCall.args)).digest("hex");

	if (apiCall.auth && req.user_token) { // If we want this call to be auth'd and we have a user token, add the token to the cache key for uniqueness.
		cacheKey += '_' + req.user_token;
	}

	cache.get(cacheKey, function(err, cacheData) {
		// Cache error.
		if (err) {
			console.error('[' + req.id + ']', '[cache] Cache.get error: ', err);
		}

		// Cache miss.
		if (!cacheData) {
			flickrAPI.get(req, apiCall.method, apiCall.params, apiCall.auth, function(err, responseData) {
				if (err) {
					console.log("Flickr API error: " + err);
					return res.send(500);
				}
				
				var photosets = {};
				_.each(responseData.photosets.photoset, function(s){
					photosets[slug(s.title._content).toLowerCase()] = {
						id: s.id,
						title: s.title._content,
						images: utils.normalizePhotoSizes(s.primary_photo_extras)
					};
				});

				cache.set(cacheKey, photosets, cacheTime, function(err) {
					if (err) {
						console.error('[' + req.id + ']', '[cache] Trying to cache value sized: ', Buffer.byteLength(JSON.stringify(photosets), 'utf8'));
						console.error('[' + req.id + ']', '[cache] Cache.set error: ', err);
					}
				});

				req.photosets = photosets;
				next();
			});

		// Cache hit.
		} else {
			console.log('[' + req.id + ']', '[cache]', 'using cached API response method=' + apiCall.method, 'key=' + cacheKey);
			req.photosets = cacheData;
			next();
		}
	});
});

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
