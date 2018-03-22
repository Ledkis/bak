const fs = require('fs');
const {promisify} = require('util');
const wikipedia = require("./my-node-wikipedia");
const logger = require ('./my-winston')(__filename);
const wikiscrapper = require('./wikiscrapper');
const datamanager = require('./datamanager');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const saveDataInfoAsync = promisify(datamanager.saveDataInfo);


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

                        datamanager.getDataInfo().then((dataInfo) => {
                            const raw = dataInfo[opts.type].raw;
                            if(!raw){
                                datamanager.saveWikiDataRAW(response.parse.text["*"], opts);
                            }
                        });

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
    }).then((res) => {
        logger.info(`fetchWikiPage: ${res.list.length} elements fetched`);

        if(opts.save) datamanager.saveWikiDataJSON(res, opts);

        return res;
    });
}



module.exports = wikiapi;