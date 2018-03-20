const config = require('config');
const logger = require ('./mylogger')('bak');
const wikiapi = require('./wikiapi');
const wikiscrapper = require ('./wikiscrapper');

const wikimanager = {};

const NODE_ENV = config.get('NODE_ENV');

wikimanager.main = function(){

	logger.info(`wikimanamger main`)

	const philoData = {};

	wikiapi.fetchPhilosophesList({online: !(NODE_ENV === 'debug')}).then((res, err)=>{
		if(err) {
			logger.error(err)
			throw err;
		}

		logger.info(res.links.length);
	});


}

module.exports = wikimanager;