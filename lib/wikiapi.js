const fs = require('fs');
const wikipedia = require("node-wikipedia");
const wikiscrapper = require('./wikiscrapper');

const wikiapi = {};

wikiapi.fetchInfoBoxData = function(wikiPage){
	return new Promise((resolve, reject) => {

		wikipedia.page.data(wikiPage, { content: true , lang:'fr'}, (response, page, url) => {
			// "http://fr.wikipedia.org/w/api.php?action=parse&page=Parm%C3%A9nide&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json"

			const res = wikiscrapper.scrapInfoBox(response, page, url);

			resolve(res);
		});

	});
}

wikiapi.fetchPhilosophesList = function(opts){
		const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_de_philosophes_par_ann%C3%A9e_de_naissance&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
		const page = "Liste_de_philosophes_par_année_de_naissance";

	return new Promise((resolve, reject) => {
		let res;

		if(opts.online){
			wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
				res = wikiscrapper.scrapPhilosPage(response, page, url);			
			});
		} else {
			const pageData = fs.readFileSync(`./data/raw/${page}.html`, 'utf8');
			const response = {text: {}};

			response.text["*"] = pageData;

			res = wikiscrapper.scrapPhilosPage(response, page, url);
		}

		resolve(res);
	});
}


module.exports = wikiapi;



