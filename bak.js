const config = require('config');
const logger = require ('./lib/my-winston')('bak');
const wikimanager = require('./lib/wikimanager');

logger.info(`*** BAK: START***, NODE_ENV: ${config.get('NODE_ENV')}`)
wikimanager.main();

// node --inspect-brk bak.js