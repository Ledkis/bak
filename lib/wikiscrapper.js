const cheerio = require("cheerio");
const utils = require("./utils");
const wikiutils = require('./wikiutils');

// Add trim() to String.prototype
utils.addTrim();

const wikiscrapper = {};

wikiscrapper.scrapInfoBox = function(response, page, url){
	const data = {};
	const infobox_v3 = {};

	data.title = page;
	data.url = url;
	data.wikidata = response;

	const $ = cheerio.load(response.text["*"]);
	$('.infobox_v3 table tr').map(function(i, el) {
				// this === el
				infobox_v3[$('th', el).text()] = $('td', el).text().replace(/\n/g, " ").trim();
			});

	data.infobox_v3 = infobox_v3;

	return data;
}


wikiscrapper.scrapPhiloInfo = function(response, page, url){
	const data = {};
	data.title = page;
	data.url = url;

	data.links = [];

	const $ = cheerio.load(response.text["*"]);

	let h2Section, h3Section, h4Section;
	let context = {title : ''};
	$('.mw-parser-output')[0].children.forEach((el) => {

		if(el.name === 'h2' || el.name === 'h3' || el.name === 'h4'){
			if(el.children !== undefined && el.children.length > 1){

				if(el.children[1] !== undefined && el.children[1].children[0] !== undefined){

					let node = el.children[1].children[0];

					let section;

					if(node.type && node.type === 'text'){
						section = {title : node.data};
					} else if(node.name && node.name === 'a'){
						section = {title : node.attribs.title, href : node.attribs.href};
					}

					if(el.name === 'h2'){
						h2Section = section;
					} else if (el.name === 'h3'){
						h3Section = section;
					} else if(el.name === 'h4'){
						h4Section = section;
					}

							//console.log('section: ' + ((section && section.title) ? section.title : ''));
						}
					}
				} else if(el.name === 'ul' && el.children !== undefined && el.children.length > 1){

					// potential wiki info

					let liElem = el.children[1].children;

					// tcheck for context
					for(let i = 0; i < liElem.length - 1; i++){
						let child = liElem[i];
						if(child.name === 'ul'){

							for(let j = 0; j < 2; j++){
								// if there is a list inside a list, it's because of context (with potential link)
								let node = liElem[j];
								if(node.name === 'a'){
									context.title += node.attribs.title;
									context.href = node.attribs.href;
								} 
								if(node.type === 'text'){
									context.title = node.data;
								}
							}

							el = child;
						} else {
							context = {title : ''};
						}
					}

				// here is a list of li with philosophes info
				el.children.forEach((liNode) => {
					if(liNode.name === 'li'){
						// philosophes line


						// get precise info
						let phil = {title: ''};
						phil.attribs = [];

						if(h2Section) phil.attribs.push(h2Section);
						if(h3Section) phil.attribs.push(h3Section);
						if(h4Section) phil.attribs.push(h4Section);

						if(context.title !== '') phil.attribs.push(context);

						liNode.children.forEach((liContent, index) => {
							// the info we want for the philosophie are: text + link + don't care OR link + don't care

							if(!phil.href && liContent.name === 'a'){
								// if we start with the link, we have all the info
								phil.title += liContent.attribs.title;
								phil.href = liContent.attribs.href;
							} 
							if(!phil.title && liContent.type === 'text'){
								// if we start with text, link will come next
								phil.title = liContent.data;
							}
						});

						// get parse info
						
						let nodeText = wikiutils.liNodeToText(liNode);
						let bdInfo = wikiutils.philoBirthDateParser(nodeText);

						phil.raw = nodeText;
						if(bdInfo.birth) phil.birth = bdInfo.birth;
						if(bdInfo.death) phil.death = bdInfo.death;

						// console.log(phil);

						data.links.push(phil);			
					}
				});

			}
		});

	return data;
}


module.exports = wikiscrapper;