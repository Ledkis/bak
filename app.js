const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const logger = require('./lib/my-winston')(__filename, 'verbose')
const flash = require('./lib/flash')
const wikiapi = require('./app_api/wikiapi')
const datamanager = require('./app_api/datamanager')

const app = express()

const NODE_ENV = config.get('NODE_ENV')
logger.info(`____________APP: START____________`)
logger.info(`NODE_ENV: ${NODE_ENV}`)

app.set('views', path.join(__dirname, 'app_server', 'views'))
app.set('view engine', 'ejs')

app.use('/assets', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'app_client')))

// Not working ?
// app.use('/assets', express.static('public'))
// app.use('/assets', express.static('app_client'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: 'XXX',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Routes

app.get('/', (request, response) => {
  const opts = {}
  if (request.query.optionFrom) {
    opts.from = request.query.optionFrom
    opts.dataId = request.query.selectDataId
  } else {
    opts.from = 'json'
    opts.dataId = 'papes'
  }
  const dataInfo = datamanager.getDataInfo()

  wikiapi.fetchWikiData(opts).then((wikiDatas) => {
    response.render('pages/index', {dataInfo: Object.keys(dataInfo), dataFrom: ['json', 'raw', 'wiki'], from: opts.from, wikiDatas})
    logger.verbose('page loaded')
    // response.render('pages/index')
  })
})

app.listen(8080)

// node --inspect-brk bak.js
