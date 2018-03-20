const fs = require('fs'); 
const wikiutils = require ('../lib/wikiutils');

const { performanceWrapper,  tw} = require('./testutils');

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

			console.log(`raw: ${line}, birth: ${bdInfo.birth}, death: ${bdInfo.death}`);

		});
	});
}

function* unittest (){
	yield welcomtest;
	// yield testWikiApi();
	// yield philoBirthDateParserTEST; // TODO : manage async tests
	yield mesureRegexPerformance;
}

for(let test of unittest()){
	tw(test);		
}

// node --inspect-brk ./test/unittest.js