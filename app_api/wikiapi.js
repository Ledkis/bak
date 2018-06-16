const fs = require('fs')
const config = require('config')
const wikipedia = require('../lib/my-node-wikipedia')
const logger = require('../lib/my-winston')(__filename)
const datamanager = require('./datamanager')
const wikiscrapper = require('../lib/wikiscrapper')
const wikiparser = require('../lib/wikiparser')
const apiutils = require('../lib/apiutils')
const utils = require('../lib/utils')

const wikiapi = {}

wikiapi.fetchWikiData = function (dataId, from) {
  logger.info(`fetchWikiData: ${dataId}, from: ${from}`)

  const wikiDataInfo = datamanager.getDataInfo('wikiData')

  const page = wikiDataInfo[dataId].page
  return new Promise((resolve, reject) => {
    switch (from) {
      case 'wiki':

        logger.info(`fetchWikiData: ${dataId}, fetching from wikipedia...`)
        wikipedia.page.data(page, {content: true, lang: 'fr'}).then((response, page, url) => {
          if (response.error) return reject(response.error)

          const pageHtml = response.parse.text['*']

          datamanager.saveWikiDataRAW(dataId, pageHtml)

          const scrapCallback = wikiscrapper.getWikiScrapper(wikiDataInfo[dataId].wikiDataType)

          resolve(scrapCallback(pageHtml))
        }).catch(err => reject(err))
        break

      case 'raw':
        datamanager.getWikiDataRaw(page).then((pageHtml) => {
          const scrapCallback = wikiscrapper.getWikiScrapper(wikiDataInfo[dataId].wikiDataType)
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
      logger.info(`fetchWikiData: ${wikiData.list.length} elements of ${dataId} fetched from ${from}`)

      if (from !== 'json') {
        wikiparser.parseWikiData(wikiData, wikiDataInfo[dataId].wikiDataType)
        datamanager.saveWikiDataJSON(dataId, wikiData)
      }

      return wikiData
    })
}

wikiapi.updateData = function () {
  logger.info(`updateData`)

  const wikiDataInfo = datamanager.getDataInfo('wikiData')

  let dataToUpdate = []
  let promises = []

  Object.keys(wikiDataInfo).forEach((dataId) => {

    dataToUpdate.push(dataId)
    const p = this.fetchWikiData(dataId, 'wiki').then(() => {
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

  const wikiDataInfo = datamanager.getDataInfo('wikiData')

  let dataToUpdate = []
  let promises = []

  Object.keys(wikiDataInfo).forEach((dataId) => {

    dataToUpdate.push(dataId)
    const p = this.fetchWikiData(dataId, 'json')
      .then((wikiData) => {
        wikiparser.parseWikiData(wikiData, wikiDataInfo[dataId].wikiDataType)
        datamanager.saveWikiDataJSON(dataId, wikiData)
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

function updateWikiObjLocation (location, wikiObjsToUpdate){

    return apiutils.getLocation(location).then(res => {

      wikiObjsToUpdate.forEach(wikiObjToUpdate => {
        let wikiObj = wikiObjToUpdate.wikiObj
        let locType = wikiObjToUpdate.locType

        wikiObj[`${locType}Lat`] = res.geometry.location.lat
        wikiObj[`${locType}Lng`] = res.geometry.location.lng
        wikiObj[`${locType}Id`] = res.place_id
      })

    logger.info(`updateWikiObjLocation: updated ${location} for [${wikiObjsToUpdate.map(el => el.wikiObj.name).join(', ')}]`)
    return res
  }).catch(err => {
    // TODO: hack
    if(err.message.includes('OVER_QUERY_LIMIT'))
      logger.err(`updateWikiObjLocation: OVER_QUERY_LIMIT: ${location} for ${wikiObjsToUpdate.length} wikiObj(s)`)
    else 
      logger.err(err, `updateWikiObjLocation: ${location} for ${wikiObjsToUpdate.length} wikiObj(s)`)
    return {}
  })
}

function getWikiObjsForLocationUpdate (wikiData, force) {
  
  let wikiObjToUpdates = []
  
  let locTypesToGet = ['birthPlace', 'deathPlace']
    
  wikiData.list.forEach(wikiObj => {

    locTypesToGet.forEach(locType => {
      if(wikiObj[locType] && (force || !wikiObj[`${locType}Id`])) {  
        let wikiObjToUpdate = {loc: wikiObj[locType], wikiObj: wikiObj, locType: locType, dataId: wikiData.dataId}
        wikiObjToUpdates.push(wikiObjToUpdate)
      }
    })
  })

  return wikiObjToUpdates
}

/**
 * force: force the update even if wikiObj[`${locType}Id`] exists
 */
wikiapi.updateLocations = function (force) {
  logger.info(`updateLocations`)

  const wikiDataInfo = datamanager.getDataInfo('wikiData')

  return datamanager.getLocations().then(locations => {

    // for logging
    let dataToUpdate = []
    let fetchPromises = []
    // [{loc, wikiObj, locType, dataId}, ...]
    let wikiObjsToUpdate = []
    // used to save the data at the end
    let wikiDatas = {}

    Object.keys(wikiDataInfo).forEach((dataId) => {

      // if(dataId === 'monarques_en'){
        dataToUpdate.push(dataId)

        const fetchP = this.fetchWikiData(dataId, 'json')
          .then(wikiData => {
            wikiData.list = wikiData.list.filter(el => el.deathPlace)//.slice(0, 4)
            let objs =  getWikiObjsForLocationUpdate(wikiData, force)
            wikiObjsToUpdate.push(...objs)

            wikiDatas[wikiData.dataId] = wikiData
          })

        fetchPromises.push(fetchP)
      // }
    })

    logger.info(`updateLocations: force ${!!force}, to update : ${JSON.stringify(dataToUpdate)}`)

    return Promise.all(fetchPromises).then(() => {

        let p = Promise.resolve([])

        // optim: we search once for each location for several objects
        let locGroups = utils.groupsBy(wikiObjsToUpdate, 'loc')

        // we sequences the apis call
        Object.keys(locGroups).forEach(loc => {
          // we propagate the locs
          p = p.then((locs) => {
            return updateWikiObjLocation(loc, locGroups[loc]).then(newLoc => {
              return [...locs, newLoc]
            })
            // we wait between each google geocode api call
            .then((locs) => utils.wait(+config.get('apiCall').googleWait, locs))
          })
        })

        // the last promise: all calls have been made
        p.then((locs) => {
          
          // save location 
          locs.forEach(loc => locations[loc.place_id] = loc)
          datamanager.saveLocations(locations)

          // save wiki data
          let wikiDataToSave = utils.groupsBy(wikiObjsToUpdate, 'dataId')

          Object.keys(wikiDataToSave).forEach(dataId => {
            datamanager.saveWikiDataJSON(dataId, wikiDatas[dataId])
          })

          logger.info(`updateLocations: completed with ${locs.length} new loc saved`)
        })
      })
  })
}

module.exports = wikiapi