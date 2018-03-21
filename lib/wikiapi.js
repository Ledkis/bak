const fs = require('fs');
const wikipedia = require("./my-node-wikipedia");
const logger = require ('./my-winston')('bak');
const wikiscrapper = require('./wikiscrapper');

const wikiapi = {};

wikiapi.fetchInfoBoxData = function(wikiPage){
	return new Promise((resolve, reject) => {

		wikipedia.page.data(wikiPage, { content: true , lang:'fr'}, (response, page, url) => {
			// "http://fr.wikipedia.org/w/api.php?action=parse&page=Parm%C3%A9nide&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json"

			const res = wikiscrapper.scrapInfoBox(response, page, url);

			resolve(res);
		});

	});
}

wikiapi.fetchPhilosophesList = function(opts){
		const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_de_philosophes_par_ann%C3%A9e_de_naissance&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
		const page = "Liste_de_philosophes_par_année_de_naissance";

	return new Promise((resolve, reject) => {
		let res;

		if(opts.online){
			wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
				res = wikiscrapper.scrapPhilosPage(response, page, url);			
			});
		} else {
			const pageData = fs.readFileSync(`./data/raw/${page}.html`, 'utf8');
			const response = {text: {}};

			response.text["*"] = pageData;

			res = wikiscrapper.scrapPhilosPage(response, page, url);
		}

		resolve(res);
	});
}

wikiapi.fetchPapesList = function(opts){
	const url = "http://fr.wikipedia.org/w/api.php?action=parse&page=Liste_des_papes&prop=categories%7Cexternallinks%7Clinks%7Ctext&lang=fr&redirects=true&format=json";
	const page = "Liste_des_papes";

	logger.info(`fetchPapesList: ${page}, opts: ${JSON.stringify(opts)}`);

    //no need to save the file if we fetch from it
    if(opts.from === 'json') opts.save = false;

	return new Promise((resolve, reject) => {
        switch (opts.from) {
            case 'wiki':
                wikipedia.page.data(page, { content: true , lang:'fr'}, (response, page, url) => {
                    // TODO: Promise && Remove try catch ?
                    try{
                        if(response.error) return reject(response.error);

                        resolve(wikiscrapper.scrapPapesPage(response.parse, page, url));
                    } catch(err){
                        reject(err);
                    }
                });
                break;
    
            case 'raw':
                fs.readFile(`./data/raw/${page}.html`, 'utf8', (err, data) => {
                    try{
                        if (err) return reject(err);

                        const response = {text: {}};
                        response.text["*"] = data;

                        resolve(wikiscrapper.scrapPapesPage(response, page, url));
                    } catch(err){
                        reject(err);
                    }
                });
                break;

            case 'json':
            default:
                fs.readFile(`./data/json/${page}.json`, 'utf8', (err, data) => {
                        try{
                            if (err) return reject(err);

                            resolve(JSON.parse(data));
                        } catch(err){
                            reject(err);
                        }
                    });
        }
    }).then((res, err) => {
        if(err) throw err;

        if(opts.save){
            return new Promise(function(resolve, reject) {
                fs.writeFile(`./data/json/${res.title}.json`, JSON.stringify(res, null, 4), function(err) {
                    if (err) return reject(err);
                    logger.info(`data/json/${res.title}.json saved`);
                    resolve(res);
                });
            });
        }
        return res;

    });
}



module.exports = wikiapi;



