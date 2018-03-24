const config = require('config')
const logger = require('./lib/my-winston')(__filename)
const wikiapi = require('./app_api/wikiapi')

const NODE_ENV = config.get('NODE_ENV')

logger.info(`____________BAK: START____________`)
logger.info(`NODE_ENV: ${NODE_ENV}`)

// //Sync is ok here
// const dataInfo = datamanager.getDataInfoSync();

// const opts = {type:type, from:'wiki', save:true, page:dataInfo[type].page};

// // TODO moche : opts & dataInfo
// wikiapi.fetchWikiData(opts, dataInfo).catch(error => logger.err(error));

wikiapi.updateData(true)

// node --inspect-brk bak.js
