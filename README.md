## Snippets

var wikiapi = require('./app_api/wikiapi')
wikiapi.updateParsing()

var wikiapi = require('./app_api/wikiapi'); var data;
wikiapi.fetchWikiData({dataId: 'monarques_fr', from: 'wiki'}).then((wikiData) => {
  data = wikiData
})

var moment = require('./lib/my-moment')

