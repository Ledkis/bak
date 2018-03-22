const winston = require('winston');
const moment = require('moment');
const path = require('path');
const utils = require('./utils');

const LEVEL_SIZE = 5;
const LABEL_SIZE = 16;

module.exports = (function(file){


	const config = winston.config;
	const logger = new (winston.Logger)({
			colors: {warn: 'yellow'},
			transports: [
			new (winston.transports.Console)({
				timestamp: () => moment.utc().format("DD-MM-YYYY-h:mm:ss"),
				// file can be undefined ??
				label: path.basename(file, '.js'),
				formatter: function(options) {
			        // - Return string will be passed to logger.
			        // - Optionally, use options.colorize(options.level, <string>) to
			        //   colorize output based on the log level.
			        return options.timestamp() + ' ' +
			        config.colorize(options.level, utils.logTrim(options.level.toUpperCase(), LEVEL_SIZE)) + ' ' +
			        utils.logTrim('[' + (options.label ? options.label : '') + ']', LABEL_SIZE) + ' ' +
			        (options.message ? options.message : '') +
			        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
		    	}

			}),
			new (winston.transports.File)({
				filename: `./log/log.log`,
				label: path.basename(file, '.js'),
			})
			]
	})

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