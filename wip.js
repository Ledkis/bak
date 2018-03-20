const config = require('config');
const wikipedia = require("node-wikipedia");
const cheerio = require("cheerio");
const fs = require('fs');
const logger = require ('./lib/mylogger')('wip');
const wikimanager = require('./lib/wikimanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________WIP: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)
//wikimanager.main();

function fetchPapesList(opts){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Liste_des_papes";

	return new Promise((resolve, reject) => {
		let res;

		if(opts.online){
			wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
				res = scrapPapesPage(response, page, url);			
			});
		} else {
			const pageData = fs.readFileSync(`./data/raw/${page}.html`, 'utf8');
			const response = {text: {}};

			response.text["*"] = pageData;

			res = scrapPapesPage(response, page, url);
		}

		resolve(res);
	}).catch(error => { logger.err(error); });
;
}


function scrapPapesPage(response, page, url){
	const data = {};
	data.title = page;
	data.url = url;

	data.links = [];

	const $ = cheerio.load(response.text["*"]);

	let h2Section, h3Section, h4Section;
	let context = {title : ''};
	$('.mw-parser-output')[0].children.forEach((el) => {

		
	});

	return data;
}


fetchPapesList({online: !(NODE_ENV === 'debug')});

// node --inspect-brk wip.js