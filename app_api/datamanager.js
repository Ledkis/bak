const fs = require('fs')
const config = require('config')
const {promisify} = require('util')
const logger = require('../lib/my-winston')(__filename)

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const datamanager = {}

const dataInfoFile = config.get('dataInfoFile')

const dataInfo = init()

function init () {
  return JSON.parse(fs.readFileSync(dataInfoFile, 'utf8'))
}

function getWikiRawFilePath (fileName) {
  return `./data/wiki/raw/${fileName}.html`
}

function getWikiJsonFilePath (fileName) {
  return `./data/wiki/json/${fileName}.json`
}

datamanager.getDataInfo = function (dataType) {
  return dataInfo[dataType]
}

// datamanager.getDataInfo = function () {
//   return readFileAsync(dataInfoFile, 'utf8').then((dataInfoRaw) => {
//     return JSON.parse(dataInfoRaw)
//   })
// }

/**
  Private
*/
function saveDataInfo () {
  return writeFileAsync(dataInfoFile, JSON.stringify(dataInfo, null, 4))
    .then(() => logger.verbose(`saveDataInfo: dataInfo saved`))
    .catch(err => logger.err(err, `saveDataInfo`))
}

/**
  Private
*/
function updateWikiDataInfo (dataId, newInfo) {
  dataInfo.wikiData[dataId] = Object.assign(dataInfo.wikiData[dataId], newInfo)
  logger.verbose(`updateDataInfo: ${dataId}: ${JSON.stringify(newInfo)} updated`)

  saveDataInfo()
}

datamanager.getWikiDataRaw = function (page) {
  return readFileAsync(getWikiRawFilePath(page), 'utf8')
}

datamanager.saveWikiDataRAW = function (dataId, rawData) {
  const {raw, page} = dataInfo.wikiData[dataId]
  if (raw) {
    logger.verbose(`saveWikiDataRAW: data/raw/${page}.html up to date`)
    return
  }

  const file = getWikiRawFilePath(page)

  writeFileAsync(file, rawData)
    .then(() => {
      logger.verbose(file)
      updateWikiDataInfo(dataId, {raw: true})
    })
    .catch(err => logger.err(err, `saveWikiDataRAW`))
}

datamanager.getWikiDataJSON = function (page) {
  return readFileAsync(getWikiJsonFilePath(page), 'utf8')
    .then((rawData) => {
      return JSON.parse(rawData)
    })
}

datamanager.saveWikiDataJSON = function (dataId, parsedWikiData) {
  parsedWikiData.lastupdate = new Date()
  parsedWikiData.page = dataInfo.wikiData[dataId].page
  parsedWikiData.dataId = dataId

  const file = getWikiJsonFilePath(parsedWikiData.page)

  writeFileAsync(file, JSON.stringify(parsedWikiData, null, 4))
    .then(() => {
      logger.verbose(`${file} saved`)
      updateWikiDataInfo(dataId, {json: true})
    })
    .catch(err => logger.err(err, `saveWikiDataJSON`))
}

module.exports = datamanager
