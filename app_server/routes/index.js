const express = require('express')
const logger = require('../../lib/my-winston')(__filename, 'verbose')
const moment = require('../../lib/my-moment')
const wikiapi = require('../../app_api/wikiapi')
const datamanager = require('../../app_api/datamanager')
const wikiparser = require('../../lib/wikiparser')

const router = express.Router()

let curDataId = 'monarques_ge'

router.get('/api/data', function(request, response) {
  logger.verbose('/api/data', JSON.stringify(request.query.dataId), 'curDataId', curDataId)

  wikiapi.fetchWikiData(curDataId, 'json').then(wikiData => {
    response.json({data: wikiData}) 
  })
});

/* GET home page. */
router.get('*', (request, response) => {
    logger.verbose('get', JSON.stringify(request.query.dataId), 'curDataId', curDataId)

    if(request.query.dataId) curDataId = request.query.dataId

    const googleApiUrl = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&callback=initFRONT`
    response.render('pages/index', { googleApiUrl});
    //response.render('pages/index')
})

module.exports = router
