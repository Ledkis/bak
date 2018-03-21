const wikipedia = require("node-wikipedia");
const dial = require("node-wikipedia/lib/dial")



wikipedia.page.data = function(page, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	var params = {
		action: "parse",
		//oldid: revid,
		page: page,
		prop: "categories|externallinks|links",
		lang: opts.lang || 'en'
	}

	if (opts.content) {
		params.prop += "|text";
	}

	if (opts.wikitext) {
		params.prop += "|wikitext";
	}

	if (opts.redirects || typeof opts.redirects === "undefined") {
		params.redirects = true;
	}

	dial(params, function(d, url) {
		// include the original page as second parameter in case redirect changed it

		// FIX : 
		//callback(d.parse, page, url);
		// remove d.parse for getting the error in d if there is one
		callback(d, page, url);
	});
}

module.exports = wikipedia;


// node --inspect-brk lib/node-wikipedia-wrapper.js