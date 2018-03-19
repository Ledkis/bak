const  wikipedia = require("node-wikipedia");
const cheerio = require("cheerio");
const utils = require("./utils");

utils.addTrim();

const wikiparser = {};

wikiparser.loadData = function(wikiPage){
	return new Promise((resolve, reject) => {
		wikipedia.page.data(wikiPage, { content: true , lang:'fr'}, function(response) {

			const $ = cheerio.load(response.text["*"]);
			const infoData = {};

			$('.infobox_v3 table tr').map(function(i, el) {
				// this === el
				infoData[$('th', el).text()] = $('td', el).text().replace(/\n/g, " ").trim();
			});

			resolve(infoData);
		});

	});
}

module.exports = wikiparser;



