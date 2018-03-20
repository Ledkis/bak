const wikiapi = require('./lib/wikiapi');


// wikiapi.fetchInfoBoxData('Parménide').then((res, err)=>{
// 	if(err) {
// 		throw err;
// 	}

// 	console.log(res.infobox_v3);
// });

wikiapi.fetchPhilosophesList().then((res, err)=>{
	if(err) {
		throw err;
	}

	console.log(res.links.length);
});

// node --inspect-brk bak.js