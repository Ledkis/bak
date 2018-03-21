const config = require('config');
const logger = require ('./my-winston')('bak');
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){

	logger.info(`wikimanamger main`)

	const philoData = {};

	// wikiapi.fetchPhilosophesList({online: !(NODE_ENV === 'debug')}).then((res, err)=>{
	// 	if(err) {
	// 		logger.error(err)
	// 		throw err;
	// 	}

	// 	logger.info(res.links.length);
	// });

	const philosUrl = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_de_philosophes_par_ann%C3%A9e_de_naissance&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const philosPage = "Liste_de_philosophes_par_année_de_naissance";

	const papesUrl = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const papesPage = "Liste_des_papes";

	const opts = {from:'wiki', save:true, page:papesPage};

	wikiapi.fetchWikiPage(opts, wikiscrapper.scrapPapesPage).then((res, err) => {
	    if(err) throw err;
	    logger.info(`papes nbr: ${res.list.length}`)
	}).catch(error => { 
	    logger.err(error); 
	});
}

module.exports = wikimanager;