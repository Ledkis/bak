const fs = require('fs');
const wikipedia = require("./my-node-wikipedia");
const logger = require ('./my-winston')(__filename);
const wikiscrapper = require('./wikiscrapper');
const datamanager = require('./datamanager');

const wikiapi = {};

wikiapi.fetchWikiData = function(opts, dataInfo){

	logger.info(`fetchWikiData: ${opts.page}, save: ${opts.save}`);

    //no need to save the file if we fetch from it
    if(opts.from === 'json') opts.save = false;

	return new Promise((resolve, reject) => {
        switch (opts.from) {
            case 'wiki':
                wikipedia.page.data(opts.page, { content: true , lang:'fr'}).then((response, page, url) => {
                    if(response.error) return reject(response.error);

                    datamanager.checkIfSaveWikiDataRAW(response.parse.text["*"], opts);

                    const scrapCallback = wikiscrapper.getWikiScrapper(dataInfo[opts.type].wikiDataType);

                    resolve(scrapCallback(response.parse, opts.page, url));
                }).catch(err => reject(err));
                break;
    
            case 'raw':
                datamanager.getWikiDataRaw(opts).then((res) => {
                    const scrapCallback = wikiscrapper.getWikiScrapper(dataInfo[opts.type].wikiDataType);
                    resolve(scrapCallback(res, opts.page));
                }).catch(err => reject(err));
                break;

            case 'json':
            default:
                datamanager.getWikiDataJSON(opts).then((wikiData) => {
                    resolve(wikiData);
                }).catch(err => reject(err));
                break;

        }
    }).then((res) => {
        logger.info(`fetchWikiData: ${res.list.length} elements fetched from ${opts.page}`);

        if(opts.save) datamanager.saveWikiDataJSON(res, opts);

        return res;
    });
}

wikiapi.updateData = function(force){
    logger.info(`updateData: force=${force}`);

    const dataInfo = datamanager.getDataInfoSync(); 

    let dataToUpdate = [];

    Object.keys(dataInfo).forEach((wikiDataKey) => {
        const wikiDataInfo = dataInfo[wikiDataKey];

        let opts;
        if(force || !wikiDataInfo.raw){
            opts = {type:wikiDataKey, from:'wiki', save:true, page:wikiDataInfo.page};
            
        } else if(!wikiDataInfo.json){
            opts = {type:wikiDataKey, from:'raw', save:true, page:wikiDataInfo.page};
        }

        if(opts){
            dataToUpdate.push(wikiDataKey);         
            this.fetchWikiData(opts, dataInfo).then(() => {
                logger.info(`updateData: ${wikiDataKey} updated`);
            }).catch(error => logger.err(error));
        } 
    });

    if(dataToUpdate.length > 0){
        logger.info(`updateData: to update : ${JSON.stringify(dataToUpdate)}`);
    } else {
        logger.info(`updateData: up to date`);
    }

}



module.exports = wikiapi;