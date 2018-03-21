const config = require('config');
const cheerio = require("cheerio");
const fs = require('fs');
const logger = require ('./lib/my-winston')('wip');
const wikimanager = require('./lib/wikimanager');

const NODE_ENV = config.get('NODE_ENV');

logger.info(`____________WIP: START____________`);
logger.info(`NODE_ENV: ${NODE_ENV}`)

// node --inspect-brk wip.js