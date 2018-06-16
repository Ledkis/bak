## Snippets

var moment = require('./lib/my-moment')
var logger = require('../lib/my-winston')('REPL')


require('./app_api/wikiapi').updateParsing()
require('./app_api/wikiapi').updateData()
require('./app_api/wikiapi').updateLocations()
require('./lib/apiutils').getLocation()

var wikiapi = require('./app_api/wikiapi'); var data;
wikiapi.fetchWikiData({dataId: 'monarques_fr', from: 'wiki'}).then((wikiData) => {
  data = wikiData
})


## link

https://developers.google.com/maps/pricing-and-plans/

## api

mail: emile.quenee@gmail.com
project name: bbak
API_KEY: AIzaSyAq-SoSY8Dw59k9wK-n0bUc9_YQbcbAcUQ