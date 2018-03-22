const config = require('config');
const logger = require ('./my-winston')(__filename);
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');
const datamanager = require('./datamanager');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){

	logger.info(`wikimanamger main`)

	wikimanager.fetchWikiPage('monarques_fr');	
}

wikimanager.fetchWikiPage = function(type){

	//Sync is ok here
	const dataInfo = datamanager.getDataInfoSync();

	const opts = {type:type, from:'json', save:true, page:dataInfo[type].page};
	
	wikiapi.fetchWikiPage(opts, wikiscrapper[dataInfo[type].callback]).catch(error => logger.err(error));
}

module.exports = wikimanager;