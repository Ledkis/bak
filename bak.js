const wikiParser = require('./lib/wikiparser');

wikiParser.loadData('Parménide').then((res, err)=>{
	if(err) {
		throw err;
	}

	console.log(res);
});

// node --inspect-brk bak.js