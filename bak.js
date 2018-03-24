const config = require('config')
const logger = require('./lib/my-winston')(__filename)
const wikiapi = require('./app_api/wikiapi')

const NODE_ENV = config.get('NODE_ENV')

logger.info(`____________BAK: START____________`)
logger.info(`NODE_ENV: ${NODE_ENV}`)

const opts = {dataId: 'philos', from: 'json'}

// wikiapi.fetchWikiData(opts).catch(error => logger.err(error))

wikiapi.updateData()

// node --inspect-brk bak.js
