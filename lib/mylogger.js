const moment = require('moment');
const winston = require('winston');

const mylogger = {};


module.exports = (function(type){

	const logger = new (winston.Logger)({
		transports: [
		new (winston.transports.Console)({ level: 'debug' }),
		new (winston.transports.File)({
			filename: `./log/${type}_${moment.utc().format("DD-MM-YYYY")}.log`, level: 'info'})
		]
	});

	logger.err = function(error){
		if(error instanceof Error){
			this.error(error.message);
			console.log(error.stack);
		} else {
			this.error(error);
		}
	}

	logger.test = function(msg){
		//console.log(msg);
		this.info(msg);

	}

	return logger;
});