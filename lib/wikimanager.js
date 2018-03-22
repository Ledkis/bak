const config = require('config');
const logger = require ('./my-winston')(__filename);
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');
const datamanager = require('./datamanager');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){
	logger.info(`main`)

	wikimanager.updateData(false);	
}

wikimanager.fetchWikiData = function(type){

	//Sync is ok here
	const dataInfo = datamanager.getDataInfoSync();

	const opts = {type:type, from:'wiki', save:true, page:dataInfo[type].page};

	// TODO moche : opts & dataInfo
	wikiapi.fetchWikiData(opts, dataInfo).catch(error => logger.err(error));
}

wikimanager.updateData = function(force){
	logger.info(`updateData: force=${force}`);

	const dataInfo = datamanager.getDataInfoSync();	

	let dataToUpdate = [];

	Object.keys(dataInfo).forEach((wikiDataKey) => {
		const wikiDataInfo = dataInfo[wikiDataKey];

		let opts;
		if(force || !wikiDataInfo.raw){
			opts = {type:wikiDataKey, from:'wiki', save:true, page:wikiDataInfo.page};
			
		} else if(!wikiDataInfo.json){
			opts = {type:wikiDataKey, from:'raw', save:true, page:wikiDataInfo.page};
		}

		if(opts){
			dataToUpdate.push(wikiDataKey);			
			wikiapi.fetchWikiData(opts, dataInfo).then(() => {
				logger.info(`updateData: ${wikiDataKey} updated`);
			}).catch(error => logger.err(error));
		} 
	});

	if(dataToUpdate.length > 0){
		logger.info(`updateData: to update : ${JSON.stringify(dataToUpdate)}`);
	} else {
		logger.info(`updateData: up to date`);
	}

}

module.exports = wikimanager;