var _ = require('underscore'),
	express = require('express'),
	router = express.Router(),
	flickrAPI = require('../lib/flickr-api'),
	utils = require('../lib/utilities'),
	cache = require('../lib/cache'),
	crypto = require('crypto');

/* GET home page. */
router.get('/gallery', function(req, res) {
	if (req.query.embedded) {
		return res.render('embed', { photosets: req.photosets, layout: false });
	}
	
	return res.render('index', { title: 'Gallery', photosets: req.photosets });
});

router.get('/gallery/:set_slug', function(req, res) {
	var photoset = req.photosets[req.params.set_slug] || null;

	if (photoset) {
		var setCall = {
			method: 'flickr.photosets.getPhotos',
			auth: false,
			cachetime: 60*60, // 1 Hour cache. 
			params: {
				extras: 'url_q,url_n,url_z,url_l,url_h,url_k,media',
				page: 1,
				per_page: 500,
				photoset_id: photoset.id
			}
		};

		flickrAPI.get(req, setCall.method, setCall.params, setCall.auth, function(err, responseData) {
			if (err) {
				console.log("Flickr API error: " + err);
				return res.send(500);
			}

			if (responseData.stat=== "fail") {
				console.log("Set not found, or other Flickr error: " + req.params.set_id);
				return res.send(404);
			}

			var photos = utils.photosFromList(responseData.photoset.photo);

			res.render('photoset', { title: photoset.title, id: photoset.id, photos: photos });
		});
	} else {
		return res.send(404);
	}
});

module.exports = router;
