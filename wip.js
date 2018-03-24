const config = require('config')
const logger = require('./lib/my-winston')(__filename)

const NODE_ENV = config.get('NODE_ENV')

logger.info(`____________WIP: START____________`)
logger.info(`NODE_ENV: ${NODE_ENV}`)

// node --inspect-brk wip.js
