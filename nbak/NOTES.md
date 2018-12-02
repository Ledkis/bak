## Snippets for développement

var moment = require('./lib/my-moment')
var logger = require('../lib/my-winston')('REPL')
var config = require('config')


require('./app_api/wikiapi').updateData()
require('./app_api/wikiapi').updateParsing()
require('./app_api/wikiapi').updateLocations(true)
require('./lib/apiutils').getLocation('paris')

var wikiapi = require('./app_api/wikiapi'); var data;
wikiapi.fetchWikiData({dataId: 'monarques_fr', from: 'wiki'}).then((wikiData) => {
  data = wikiData
})
