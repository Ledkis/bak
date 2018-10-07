require('dotenv').config()
const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const createError = require('http-errors');
const logger = require('./lib/my-winston')(__filename, 'verbose')
const wikiapi = require('./app_api/wikiapi')
const datamanager = require('./app_api/datamanager')

var indexRouter = require('./app_server/routes/index');

const app = express()

const NODE_ENV = config.get('NODE_ENV')
logger.info(`____________APP: START____________`)
logger.info(`NODE_ENV: ${NODE_ENV}`)

app.set('views', path.join(__dirname, 'app_server', 'views'))
app.set('view engine', 'ejs')

// Middlewares
app.use('/assets', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'app_client')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app