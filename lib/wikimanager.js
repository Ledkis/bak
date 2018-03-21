const config = require('config');
const logger = require ('./my-winston')('bak');
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');
const datamanager = require('./datamanager');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){

	logger.info(`wikimanamger main`)

	wikimanager.fetchWikiPage('papes');	
}

wikimanager.fetchWikiPage = function(type){

	//Sync is ok here
	const dataInfo = datamanager.getDataInfoSync();

	const opts = {from:'wiki', save:true, page:dataInfo[type].page};
	

	wikiapi.fetchWikiPage(opts, wikiscrapper[dataInfo[type].callback]).then((res, err) => {
	    if(err) throw err;
	    logger.info(`res nbr: ${res.list.length}`)
	}).catch(error => { 
	    logger.err(error); 
	});
}

module.exports = wikimanager;