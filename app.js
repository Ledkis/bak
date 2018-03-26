const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const logger = require('./lib/my-winston')(__filename, 'verbose')
const flash = require('./lib/flash')
const wikiapi = require('./app_api/wikiapi')

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

app.use(flash)

// Routes

app.get('/', (request, response) => {
  const opts = {dataId: 'papes', from: 'json'}

  wikiapi.fetchWikiData(opts).then((wikiDatas) => {
    response.render('pages/index', {dataId: 'papes', wikiDatas})
    logger.verbose('page loaded')
    // response.render('pages/index')
  })
})

app.post('/', (request, response) => {
  // if (request.body === undefined || request.body.message === '') {
  //   request.flash('error', 'Vous n\'avez pas entré de messages.')
  //   response.redirect('/')
  // } else {
  //   Message.create(request.body.message, () => {
  //     request.flash('success', 'Merci')
  //     response.redirect('/')
  //   })
  // }
})

app.get('/messages/:id', (request, response) => {
  // Message.find(request.params.id, (message) => {
  //   response.render('messages/show', {message: message})
  // })
})

app.listen(8080)

// node --inspect-brk bak.js
