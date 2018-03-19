const  wikipedia = require("node-wikipedia");
const cheerio = require("cheerio");
const utils = require("./utils");
const scraper = require('webscraper');

utils.addTrim();

const wikiapi = {};

wikiapi.loadData = function(wikiPage){
	return new Promise((resolve, reject) => {
		wikipedia.page.data(wikiPage, { content: true , lang:'fr'}, function(response, page, url) {
			// "http://fr.wikipedia.org/w/api.php?action=parse&page=Parm%C3%A9nide&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json"

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

			resolve(data);
		});

	});
}

wikiapi.fetchPhilosophesList = function(){
	const listPhilosophesLink = "Liste_de_philosophes_par_année_de_naissance";

	return new Promise((resolve, reject) => {

		wikipedia.page.data(listPhilosophesLink, { content: true , lang:'fr'}, function(response, page, url) {

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

					let liElem = el.children[1].children;

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

				el.children.forEach((liNode) => {
					if(liNode.name === 'li'){

						var phil = {title: ''};
						phil.attribs = [];

						if(h2Section) phil.attribs.push(h2Section);
						if(h3Section) phil.attribs.push(h3Section);
						if(h4Section) phil.attribs.push(h4Section);

						if(context.title !== '') phil.attribs.push(context);

						liNode.children.forEach((liContent, index) => {
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

						data.links.push(phil);			
					}
				});

			}
		});

			resolve(data);
		});

	});
}

module.exports = wikiapi;



