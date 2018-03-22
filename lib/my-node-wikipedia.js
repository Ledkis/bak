const wikipedia = require("node-wikipedia");
const dial = require("node-wikipedia/lib/dial")

wikipedia.page.data = function(page, opts) {
	return new Promise((resolve, reject) => {
		try {
			if (arguments.length < 2) {
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

			dial(params, function(response, url) {
				// include the original page as second parameter in case redirect changed it

				// FIX : 
				//callback(response.parse, page, url);
				// remove response.parse for getting the error in response if there is one
				resolve(response, page, url);
			});	
		} catch(err){
			reject(err);
		}
	})
	
}

module.exports = wikipedia;


// node --inspect-brk lib/node-wikipedia-wrapper.js