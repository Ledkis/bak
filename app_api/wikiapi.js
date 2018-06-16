const fs = require('fs')
const wikipedia = require('../lib/my-node-wikipedia')
const logger = require('../lib/my-winston')(__filename)
const datamanager = require('./datamanager')
const wikiscrapper = require('../lib/wikiscrapper')
const wikiparser = require('../lib/wikiparser')
const apiutils = require('../lib/apiutils')

const wikiapi = {}

wikiapi.fetchWikiData = function (opts) {
  logger.info(`fetchWikiData: ${opts.dataId}, from: ${opts.from}`)

  const dataInfo = datamanager.getDataInfo()

  const page = dataInfo[opts.dataId].page
  return new Promise((resolve, reject) => {
    switch (opts.from) {
      case 'wiki':

        logger.info(`fetchWikiData: ${opts.dataId}, fetching from wikipedia...`)
        wikipedia.page.data(page, {content: true, lang: 'fr'}).then((response, page, url) => {
          if (response.error) return reject(response.error)

          const pageHtml = response.parse.text['*']

          datamanager.saveWikiDataRAW(opts.dataId, pageHtml)

          const scrapCallback = wikiscrapper.getWikiScrapper(dataInfo[opts.dataId].wikiDataType)

          resolve(scrapCallback(pageHtml))
        }).catch(err => reject(err))
        break

      case 'raw':
        datamanager.getWikiDataRaw(page).then((pageHtml) => {
          const scrapCallback = wikiscrapper.getWikiScrapper(dataInfo[opts.dataId].wikiDataType)
          resolve(scrapCallback(pageHtml))
        }).catch(err => reject(err))
        break

      case 'json':
      default:
        datamanager.getWikiDataJSON(page).then((wikiData) => {
          resolve(wikiData)
        }).catch(err => reject(err))
        break
    }
  })
    .then((wikiData) => {
      logger.info(`fetchWikiData: ${wikiData.list.length} elements of ${opts.dataId} fetched from ${opts.from}`)

      if (opts.from !== 'json') {
        wikiparser.parseWikiData(wikiData, dataInfo[opts.dataId])
        datamanager.saveWikiDataJSON(opts.dataId, wikiData)
      }

      return wikiData
    })
}

wikiapi.updateData = function () {
  logger.info(`updateData`)

  const dataInfo = datamanager.getDataInfo()

  let dataToUpdate = []
  let promises = []

  Object.keys(dataInfo).forEach((dataId) => {
    const wikiDataInfo = dataInfo[dataId]

    const opts = {dataId: dataId, from: 'wiki'}

    dataToUpdate.push(dataId)
    const p = this.fetchWikiData(opts).then(() => {
      logger.info(`updateData: ${dataId} updated`)
    }).catch(err => logger.err(err))

    promises.push(p)
  })

  Promise.all(promises)
    .then(() => {
      logger.info(`updateData: end`)
    })

  logger.info(`updateData: to update : ${JSON.stringify(dataToUpdate)}`)
}

wikiapi.updateParsing = function () {
  logger.info(`updateParsing`)

  const dataInfo = datamanager.getDataInfo()

  let dataToUpdate = []
  let promises = []

  Object.keys(dataInfo).forEach((dataId) => {
    const wikiDataInfo = dataInfo[dataId]

    const opts = {dataId: dataId, from: 'json', page: wikiDataInfo.page}

    dataToUpdate.push(dataId)
    const p = this.fetchWikiData(opts, dataInfo).then((wikiData) => {
      let wikiDataInfo = dataInfo[dataId]
      wikiparser.parseWikiData(wikiData, wikiDataInfo)
      datamanager.saveWikiDataJSON(opts.dataId, wikiData)
      logger.info(`updateParsing: ${dataId} updated`)
    }).catch(err => logger.err(err))

    promises.push(p)
  })

  logger.info(`updateParsing: to update : ${JSON.stringify(dataToUpdate)}`)

  Promise.all(promises)
    .then(() => {
      logger.info(`updateParsing: end`)
    })
}

wikiapi.getLocation = function (wikiObj){

  let locations = {}
  let promises = []
  let searchedLocations = []

  let locTypesToGet = ['birthPlace', 'deathPlace']

  locTypesToGet.forEach(locType => {
    if(wikiObj[locType]) {
      let p = apiutils.getLocation(wikiObj.birthPlace).then(res => {
        wikiObj[`${locType}Lat`] = res.geometry.location.lat
        wikiObj[`${locType}Lng`] = res.geometry.location.lng
        locations[res.place_id] = res
      }).catch(err => logger.err(err, `getLocation: ${wikiObj.name} ${locType} ${wikiObj.birthPlace}`))
      promises.push(p)
      searchedLocations.push(wikiObj[locType])
    }
  })

  return Promise.all(promises)
    .then(() => {
      if(wikiObj.name && searchedLocations.length > 0)
        logger.info(`getLocation: ${wikiObj.name}: [${searchedLocations.join(' ')}] completed`)
      return locations
    })
}

wikiapi.getAllLocations = function (wikiData) {
  logger.info(`getAllLocations`)

  let promises = []
  let locations = {}

  wikiData.list.forEach(wikiObj => {
    let p = wikiapi.getLocation(wikiObj).then(locs => {
      locations = Object.assign(locations, locs)
      return locations
    })
    promises.push(p)
  })

  return Promise.all(promises)
    .then(() => {
      logger.info(`getAllLocations: ${wikiData.dataId} completed`)
      datamanager.saveWikiDataJSON(wikiData.dataId, wikiData)
      return locations
    })
}

wikiapi.updateLocations = function () {
  logger.info(`updateLocations`)

  const dataInfo = datamanager.getDataInfo()

  let dataToUpdate = []
  let promises = []

  let locations = {}

  Object.keys(dataInfo).forEach((dataId) => {
    const wikiDataInfo = dataInfo[dataId]

    const opts = {dataId: dataId, from: 'json', page: wikiDataInfo.page}

    // if(dataId === 'monarques_en'){
      dataToUpdate.push(dataId)

      const p = this.fetchWikiData(opts, dataInfo)
        .then(wikiData => {
          //wikiData.list = wikiData.list.filter(el => el.deathPlace).slice(0, 4)
          return wikiapi.getAllLocations(wikiData)
        }).then(locs => {
          locations = Object.assign(locations, locs)
          return locations
        })

      promises.push(p)
    // }
  })

  logger.info(`updateLocations: to update : ${JSON.stringify(dataToUpdate)}`)

  return Promise.all(promises)
    .then(() => {
      fs.writeFileSync('places.json', JSON.stringify(locations, null, 4))
      logger.info(`updateLocations: completed with ${Object.keys(locations).length} new loc saved`)
    })
}

module.exports = wikiapi