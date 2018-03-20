const fs = require('fs'); 
const logger = require ('../lib/mylogger')('unittest');
const wikiscrapper = require ('../lib/wikiscrapper');
const wikiutils = require ('../lib/wikiutils');

const {performanceWrapper, tw} = require('./testutils');

function welcomtest(){
	return 'UNIT TEST';
}


function mesureRegexPerformance(){
	const testIterator = regexPhiloBirthDateParserTEST();
	performanceWrapper(testIterator, 'short');
	performanceWrapper(testIterator, 'long');
}

function* regexPhiloBirthDateParserTEST(){
	const shortPhiloBirthDateRX = /\((?:[^-\d]*)(-{0,1}[\d]+)(?:[^-\d]*(?: - )*[^-\d]*)(-{0,1}[\d]+)(?:(?:[^\d]*)|(?: .*))\)/;
	yield shortPhiloBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)");

	const longPhiloBirthDateRX = /\(([^-\d]*)([-]*?[\d]+)([^-\d]+[-]*[^-\d]+)*([-]{0,1}[\d]+)([^-\d]*)[\w\d\s]*\)/;
	yield longPhiloBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)");
}

function testWikiApi(){
	wikipedia.page.data('Liste_de_philosophes_par_année_de_naissance', { content: true , lang:'fr'}, function(response, page, url) {

		const data = {};
		const $ = cheerio.load(response.text["*"]);

	});
}

function philoBirthDateParserTEST(){

	return fs.readFile('./test/wiki_philo_dates.txt', 'utf8', function read(err, data) {
		if (err) {
			throw err;
		}
		let datas = data.split('\n');

		let results = [];

		datas.forEach((line) => {
			let bdInfo = wikiutils.philoBirthDateParser(line);

			logger.test(`raw: ${line}, birth: ${bdInfo.birth}, death: ${bdInfo.death}`);

		});
	});
}

function wikiInfoBoxScrapTEST(){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Parm%C3%A9nide&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Parménide";

	const pageData = fs.readFileSync(`./test/data/${page}.html`, 'utf8');

	const response = {text: {}};

	response.text["*"] = pageData;

	const res = performanceWrapper(wikiscrapper.scrapInfoBox, [response, page, url], 'scrapInfoBox');

	logger.test(res.infobox_v3);
}


function wikiPhiloScrapTEST(){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_de_philosophes_par_ann%C3%A9e_de_naissance&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Liste_de_philosophes_par_année_de_naissance";

	const pageData = fs.readFileSync(`./test/data/${page}.html`, 'utf8');

	const response = {text: {}};

	response.text["*"] = pageData;

	const res = performanceWrapper(wikiscrapper.scrapPhiloInfo, [response, page, url], 'scrapPhiloInfo');

	logger.test(res.links.length);
}




//////////////////////////////////////////////////////////
/** ____________________ TEST ZONE ____________________**/
//////////////////////////////////////////////////////////



function* wikiutilsUNITTEST(){
	// yield philoBirthDateParserTEST; // TODO : manage async tests
	yield mesureRegexPerformance;
}


function* wikiscrapperUNITTEST(){
	yield wikiInfoBoxScrapTEST;
	yield wikiPhiloScrapTEST;
}


function* unittest (){
	yield welcomtest;
	// yield testWikiApi();
	
	// yield* wikiutilsUNITTEST();
	yield* wikiscrapperUNITTEST();
}

logger.test(`__________________UNIT TEST____________________`)
for(let test of unittest()){
	tw(test);		
}

// node ./test/unittest.js
// node --inspect-brk ./test/unittest.js