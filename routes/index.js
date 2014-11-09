var _ = require('underscore'),
	express = require('express'),
	router = express.Router(),
	flickrAPI = require('../lib/flickr-api'),
	utils = require('../lib/utilities');

/* GET home page. */
router.get('/', function(req, res) {
	var setsCall = {
		method: 'flickr.photosets.getList',
		auth: false,
		params: {
			user_id: '43813659@N03',
			primary_photo_extras: 'url_q,url_n,url_z,url_l,url_h,url_k'
		}
	};

	flickrAPI.get(req, setsCall.method, setsCall.params, setsCall.auth, function(err, responseData) {
		if (err) {
			console.log("Flickr API error: " + err);
			res.send(500);
		}

		console.log(responseData);
		var photosets = [];
		_.each(responseData.photosets.photoset, function(s){
			if (s.primary_photo_extras.url_l) {
				photosets.push({
					id: s.id,
					title: s.title._content,
					images: utils.normalizePhotoSizes(s.primary_photo_extras)
				});
			}
		});

		console.log(photosets);
		res.render('index', { title: 'Gallery', photosets: photosets });
	});
});

router.get('/:set_id', function(req, res) {
	var setCall = {
		method: 'flickr.photosets.getPhotos',
		auth: false,
		params: {
			extras: 'url_q,url_n,url_z,url_l,url_h,url_k,media',
			page: 1,
			per_page: 500,
			photoset_id: req.params.set_id
		}
	};

	flickrAPI.get(req, setCall.method, setCall.params, setCall.auth, function(err, responseData) {
		if (err) {
			console.log("Flickr API error: " + err);
			res.send(500);
		}

		console.log(responseData);
		var photos = utils.photosFromList(responseData.photoset.photo);

		console.log(photos);
		res.render('photoset', { title: 'Gallery', photos: photos });
	});
});

module.exports = router;
