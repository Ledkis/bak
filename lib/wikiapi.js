const fs = require('fs');
const wikipedia = require("./my-node-wikipedia");
const logger = require ('./my-winston')('bak');
const wikiscrapper = require('./wikiscrapper');

const wikiapi = {};

wikiapi.fetchWikiPage = function(opts, scrapCallback){

	logger.info(`fetchPapesList: ${opts.page}, opts: ${JSON.stringify(opts)}`);

    //no need to save the file if we fetch from it
    if(opts.from === 'json') opts.save = false;

	return new Promise((resolve, reject) => {
        switch (opts.from) {
            case 'wiki':
                wikipedia.page.data(opts.page, { content: true , lang:'fr'}, (response, page, url) => {
                    // TODO: Promise && Remove try catch ?
                    try{
                        if(response.error) return reject(response.error);

                        resolve(scrapCallback(response.parse, page, url));
                    } catch(err){
                        reject(err);
                    }
                });
                break;
    
            case 'raw':
                fs.readFile(`./data/raw/${opts.page}.html`, 'utf8', (err, data) => {
                    try{
                        if (err) return reject(err);

                        const response = {text: {}};
                        response.text["*"] = data;

                        resolve(scrapCallback(response, opts.page));
                    } catch(err){
                        reject(err);
                    }
                });
                break;

            case 'json':
            default:
                fs.readFile(`./data/json/${opts.page}.json`, 'utf8', (err, data) => {
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



