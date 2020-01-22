const axios = require("axios");

const mixerController = {
	getStreams: getStreams
};

// GET api/mixer/streams?gameName
async function getStreams(req, res, next) {
	try {
		let info = await axios({
			method: "get",
			url: "https://mixer.com/api/v1/types",
			params: { query: req.query.gameName }
		});
		if (info.data.length === 0) {
			res.status(400).json("Game not found - Mixer");
		}
		info = info.data.filter(game => game.viewersCurrent > 0)[0];
		info = {
			id: info.id,
			name: info.name,
			box_art_url: info.coverUrl
		};

		let streams = await axios({
			method: "get",
			url: `https://mixer.com/api/v1/types/${info.id}/channels`,
			params: { order: "viewersCurrent:DESC" }
		});
		streams = streams.data.slice(0, 10).map(stream => {
			return {
				user_name: stream.token,
				profile_image_url: `https://mixer.com/api/v1/users/${stream.userId}/avatar`,
				title: stream.name,
				thumbnail_url: `https://thumbs.mixer.com/channel/${stream.id}.small.jpg`,
				viewer_count: stream.viewersCurrent,
				external_link: `https://www.mixer.com/${stream.token}`
			};
		});

		const response = { ...info, ...{ streams: streams } };

		res.status(200).send(response);
	} catch (err) {
		console.log(err);
	}
}

module.exports = mixerController;
