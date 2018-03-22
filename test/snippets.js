const config = require('config');
const fs = require('fs');
const logger = require ('../lib/my-winston')(__filename);
const datamanager = require('../lib/datamanager');
const winston = require('winston');
const moment = require('moment');
const path = require('path')

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________SNIPPETS: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)


// Regex 
function regexTest(){
	const philoBirthDateRX = /\(([^-\d]*)([-]*?[\d]+)([^-\d]+[-]*[^-\d]+)*([-]{0,1}[\d]+)([^-\d]*)[\w\d\s]*\)/
	const shortPhiloBirthDateRX = /\((?:[^-\d]*)(-{0,1}[\d]+)(?:[^-\d]*(?: - )*[^-\d]*)(-{0,1}[\d]+)(?:(?:[^\d]*)|(?: .*))\)/
	console.log('short: ' + shortPhiloBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)"));
	console.log('long: ' + philoBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)"));
}

// Save data_info.json

function saveDataInfo(){

	const philosUrl = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_de_philosophes_par_ann%C3%A9e_de_naissance&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const philosPage = "Liste_de_philosophes_par_année_de_naissance";

	const papesUrl = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const papesPage = "Liste_des_papes";

	const dataInfo = {
		philos:{
			page:philosPage,
			callback:'scrapPhilosPage'
		},
		papes:{
			page:papesPage,
			callback:'scrapPapesPage'  
		}
	}

	logger.info(`save data info: ${JSON.stringify(dataInfo)}`);

	datamanager.saveDataInfoSync(dataInfo);
}

function testWinston(file){
	
	var config = winston.config;
	var log = new (winston.Logger)({
			colors: {warn: 'yellow'},
			transports: [
			new (winston.transports.Console)({
				timestamp: () => moment.utc().format("DD-MM-YYYY-h:mm:ss"),
				label: file,
				formatter: function(options) {
			        // - Return string will be passed to logger.
			        // - Optionally, use options.colorize(options.level, <string>) to
			        //   colorize output based on the log level.
			        return options.timestamp() + ' ' +
			        config.colorize(options.level, options.level.toUpperCase()) + ' ' +
			        (options.label ? options.label : '') + ' ' +
			        (options.message ? options.message : '') +
			        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
		    	}

			}),
			new (winston.transports.File)({
				filename: `./log/log.log`,
				label: file
			})
			]
	});


	log.error('data loaded', {data:{key1:'1',key2:'2'}});
	log.warn('Data to log.');

}

testWinston(path.basename(__filename, '.js'));


//saveDataInfo();

//node test/snippets.js