const wikipedia = require("node-wikipedia");
const wikiscrapper = require('./wikiscrapper');

const wikiapi = {};

wikiapi.fetchInfoBoxData = function(wikiPage){
	return new Promise((resolve, reject) => {

		wikipedia.page.data(wikiPage, { content: true , lang:'fr'}, function(response, page, url) {
			// "http://fr.wikipedia.org/w/api.php?action=parse&page=Parm%C3%A9nide&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json"

			const data = wikiscrapper.scrapInfoBox(response, page, url);

			resolve(data);
		});

	});
}

wikiapi.fetchPhilosophesList = function(){
	const listPhilosophesLink = "Liste_de_philosophes_par_année_de_naissance";

	return new Promise((resolve, reject) => {

		wikipedia.page.data(listPhilosophesLink, { content: true , lang:'fr'}, function(response, page, url) {

			const data = wikiscrapper.scrapPhiloInfo(response, page, url);
			
			resolve(data);
		});

	});
}

module.exports = wikiapi;



