const express = require('express')
const logger = require('../../lib/my-winston')(__filename, 'verbose')
const wikiapi = require('../../app_api/wikiapi')
const datamanager = require('../../app_api/datamanager')

const router = express.Router();

/* GET home page. */
router.get('/', (request, response) => {
    logger.verbose('get', JSON.stringify(request.query))
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

module.exports = router