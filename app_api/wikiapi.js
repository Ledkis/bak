const wikipedia = require('../lib/my-node-wikipedia')
const logger = require('../lib/my-winston')(__filename)
const datamanager = require('./datamanager')
const wikiscrapper = require('../lib/wikiscrapper')
const wikiparser = require('../lib/wikiparser')

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

      if(opts.dataId === 'monarques_fr') wikiparser.parseWikiData(wikiData, dataInfo[opts.dataId])

      if (opts.from !== 'json') datamanager.saveWikiDataJSON(opts.dataId, wikiData)

      return wikiData
    })
}

wikiapi.updateData = function () {
  logger.info(`updateData`)

  const dataInfo = datamanager.getDataInfo()

  let dataToUpdate = []

  const promises = []

  Object.keys(dataInfo).forEach((dataId) => {
    const wikiDataInfo = dataInfo[dataId]

    const opts = {dataId: dataId, from: 'wiki'}

    dataToUpdate.push(dataId)
    const p = this.fetchWikiData(opts).then(() => {
      logger.info(`updateData: ${dataId} updated`)
    }).catch(error => logger.err(error))

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
  const promises = []
  Object.keys(dataInfo).forEach((dataId) => {
    const wikiDataInfo = dataInfo[dataId]

    if(dataId === 'monarques_fr'){

      const opts = {dataId: dataId, from: 'json', page: wikiDataInfo.page}

      dataToUpdate.push(dataId)
      const p = this.fetchWikiData(opts, dataInfo).then((wikiData) => {
        let wikiDataInfo = dataInfo[dataId]
        wikiparser.parseWikiData(wikiData, wikiDataInfo)
        datamanager.saveWikiDataJSON(opts.dataId, wikiData)
        logger.info(`updateParsing: ${dataId} updated`)
      }).catch(error => logger.err(error))

      promises.push(p)
    }
  })

  Promise.all(promises)
    .then(() => {
      logger.info(`updateParsing: end`)
    })

  logger.info(`updateParsing: to update : ${JSON.stringify(dataToUpdate)}`)
}

module.exports = wikiapi