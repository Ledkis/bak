const express = require('express')
const logger = require('../../lib/my-winston')(__filename, 'verbose')
const moment = require('../../lib/my-moment')
const wikiapi = require('../../app_api/wikiapi')
const datamanager = require('../../app_api/datamanager')
const wikiparser = require('../../lib/wikiparser')

const router = express.Router()

let curDataId = 'monarques_fr'

/* */
router.get('/api/data/map', function(request, response) {

  wikiapi.fetchWikiData(curDataId, 'json').then(wikiData => {

    let data = wikiData.list.filter(el => {
      return el.deathPlaceLat && el.deathPlaceLng
    }).map(el => {
      return {lat: el.deathPlaceLat, lng: el.deathPlaceLng}
    })

    response.json({data}) 
  })
});

router.get('/api/data/timeline', function(request, response) {
    
  wikiapi.fetchWikiData(curDataId, 'json').then(wikiData => {
   
    response.json({data: wikiData}) 
  })
});

/* GET home page. */
router.get('*', (request, response) => {
    logger.verbose('get', JSON.stringify(request.query))
    const opts = {}

    if(request.query.dataId) curDataId = request.query.dataId
   
    response.render('pages/index')
   
   /*
   opts.from = 'json'
   opts.dataId = 'monarques_aut'
   const dataInfo = datamanager.getDataInfo()

    wikiapi.fetchWikiData(opts).then((wikiData) => {

      let datas = wikiData.list.map(el => el._Nom)

      const dataInfo = datamanager.getDataInfo()
      let wikiDataInfo = dataInfo[opts.dataId]
      wikiparser.parseWikiData(wikiData, wikiDataInfo)
      datamanager.saveWikiDataJSON(opts.dataId, wikiData)

      
      let l1 = datas.length

      let dateRegx = /\((?:(\d+)|vers (\d+\/*\d*)|(\D+\d+)|(\d+\D+\d+)) (?:-|–|–|-) (?:(\d+)|(\D+\d+)|vers (\d+\/*\d*)|(\d+\D+\d+))\)/

      function wikiToDate(str){
        if(str.length === 0) return

        let len = str.split(' ').length
        if(len === 1){
          if(str.includes('/')) str = str.split('/')[0] // on prend le premier
          return moment(str, 'YYYY')
        } else if(len === 2){
          return moment(str, 'MMMM YYYY')
        } else if(len === 3){
          if(str.includes('ou')){
             str = str.split(' ou ')[0] // on prend le premier
             return moment(str, 'YYYY')
          } else {
            return moment(str, 'DD MMMM YYYY')
          }
        } 
      }

      datas = datas.map(el => {
        let dates = dateRegx.exec(el) || []
        dates.splice(0, 1)
        dates = dates.filter(el => el !== undefined)
        dates.push(...new Array(2-dates.length).fill(''))

        return {born: wikiToDate(dates[0]), dead: wikiToDate(dates[1]), name: el}
      })
      .map(el => {
        if(el.born && el.dead) el.life = moment.duration(el.dead.diff(el.born)).asYears()
        return el
      })
      .filter(el => el.life !== undefined)

      datas.sort((a, b) => a.life - b.life)
      
      let datasStr = datas.map(el => `
                  len: ${el.life || '?'}, 
                  born: ${(el.born || moment()).format('YYYY')}, 
                  dead: ${(el.dead || moment()).format('YYYY')},
                  name: ${el.name}
                  `)

      datasStr.splice(0, 0, `life moy ${datas.reduce((acc, cur) => acc + cur.life, 0)/datas.length},
                            min: ${datas[0].life},
                            max: ${datas.slice(-1)[0].life}`)
      

      //response.render('pages/test', {datas: datasStr})
      //response.render('pages/test', {datas})
      //logger.verbose('page loaded')
      // response.render('pages/index')
    }).catch(err => {
      logger.error('error')
      //res.locals.message = err.message;
      //res.locals.error = req.app.get('env') === 'development' ? err : {};
      response.status(err.status || 500);
      response.render('error', {error: err})
    })
    */
})

module.exports = router
