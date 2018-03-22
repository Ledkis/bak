const config = require('config');
const logger = require ('./my-winston')(__filename);
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');
const datamanager = require('./datamanager');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){

	logger.info(`wikimanamger main`)

	wikimanager.fetchWikiData('empereurs_romains');	
}

wikimanager.fetchWikiData = function(type){

	//Sync is ok here
	const dataInfo = datamanager.getDataInfoSync();

	const opts = {type:type, from:'wiki', save:true, page:dataInfo[type].page};

	// TODO moche : opts & dataInfo
	wikiapi.fetchWikiData(opts, dataInfo).catch(error => logger.err(error));
}

module.exports = wikimanager;