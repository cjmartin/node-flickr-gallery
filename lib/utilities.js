var _ = require('underscore'),
	photoSizeKeys = ['k', 'h', 'l', 'c', 'z', 'm', 'n', 's', 'q', 'sq'];

exports.normalizePhotoSizes = function(photo) {

	var sizes = {
			biggest: null,
			large: null,
			medium: null,
			small: null,
			square: null
		},
		largeWidth = 1024,
		mediumWidth = 640,
		smallWidth = 320;
	
	var previousKey;

	for (var i = 0, l = photoSizeKeys.length; i < l; i++) {
		var key = photoSizeKeys[i],
		    heightAtKey = parseInt(photo['height_' + key], 10),
		    widthAtKey = parseInt(photo['width_' + key], 10);

		// Skip missing sizes
		if (isNaN(widthAtKey)) { continue; }

		if (!sizes.biggest) {

			sizes.biggest = {
				url: photo['url_' + key],
				width: parseInt(photo['width_' + key], 10),
				height: parseInt(photo['height_' + key], 10)
			};

		}

		// Skip photos that are bigger than needed
		if (widthAtKey >= largeWidth) {
			previousKey = key;
			continue;
		}

		// Check if we need to set a large image size
		if (!sizes.large) {

			// At this point we know the size's width is smaller than the desired, so we'll use one of these two as the desired size:
			//   - Use the previous size *if it exists*
			//   - Use the current size if it's the first size there is

			var keyForLargeSize = previousKey ? previousKey : key;

			sizes.large = {
				url: photo['url_' + keyForLargeSize],
				width: parseInt(photo['width_' + keyForLargeSize], 10),
				height: parseInt(photo['height_' + keyForLargeSize], 10)
			};

		}

		// Skip photos that are bigger than needed
		if (widthAtKey >= mediumWidth) {
			previousKey = key;
			continue;
		}

		// Check if we need to set a medium image size
		if (!sizes.medium) {

			var keyForMediumSize = previousKey ? previousKey : key;

			sizes.medium = {
				url: photo['url_' + keyForMediumSize],
				width: parseInt(photo['width_' + keyForMediumSize], 10),
				height: parseInt(photo['height_' + keyForMediumSize], 10)
			}

		}

		// Skip photos that are bigger than needed
		if (widthAtKey >= smallWidth) {
			previousKey = key;
			continue;
		}

		// Check if we need to set a small image size
		if (!sizes.small) {
			
			var keyForSmallSize = previousKey ? previousKey : key;
			
			sizes.small = {
				url: photo['url_' + keyForSmallSize],
				width: parseInt(photo['width_' + keyForSmallSize], 10),
				height: parseInt(photo['height_' + keyForSmallSize], 10)
			}

		}

		break;

	}

	var keyForSquareSize = 'q';

	sizes.square = {
		url: photo['url_' + keyForSquareSize],
		width: parseInt(photo['width_' + keyForSquareSize], 10),
		height: parseInt(photo['height_' + keyForSquareSize], 10)
	}

	return sizes;
}

exports.photosFromList = function(photoList) {

	var photos = [];

	_.each(photoList, function(p) {
		// If the media is not ready (probably a failed video) RUN AWAY!
		if (p['media_status'] != "ready") {
			return;
		}

		photos.push({
			id: p.id,
			title: p.title || 'Untitled',
			secret: p.secret,
			ownerId: p.owner,
			ownerName: p.ownername,
			video: (p.media === 'video') ? true : false,
			sizes: exports.normalizePhotoSizes(p)
		});
	});

	return photos;

}
