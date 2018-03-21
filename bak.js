const config = require('config');
const logger = require ('./lib/my-winston')('bak');
const wikimanager = require('./lib/wikimanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________BAK: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)
wikimanager.main();

// node --inspect-brk bak.js