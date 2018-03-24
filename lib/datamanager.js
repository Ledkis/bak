const fs = require('fs')
const config = require('config')
const {promisify} = require('util')
const logger = require('./my-winston')(__filename)

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const datamanager = {}

const dataInfoFile = config.get('dataInfoFile')

datamanager.getDataInfoSync = function () {
  return JSON.parse(fs.readFileSync(dataInfoFile, 'utf8'))
}

datamanager.saveDataInfoSync = function (dataInfo) {
  fs.writeFileSync(dataInfoFile, JSON.stringify(dataInfo, null, 4))
  logger.verbose(`saveDataInfoSync: ${dataInfoFile} saved`)
}

datamanager.getDataInfo = function () {
  return readFileAsync(dataInfoFile, 'utf8').then((dataInfoRaw) => {
    return JSON.parse(dataInfoRaw)
  })
}

datamanager.saveDataInfo = function (dataInfo) {
  return writeFileAsync(dataInfoFile, JSON.stringify(dataInfo, null, 4))
    .then((writeRes) => {
      logger.verbose(`saveDataInfo: ${dataInfoFile} saved`)
      return writeRes
    }).catch((err) => {
      logger.err(`saveDataInfo: ${err}`)
    })
}

datamanager.updateDataInfoType = function (dataInfoType, type) {
  this.getDataInfo().then((dataInfo) => {
    dataInfo[type] = Object.assign(dataInfo[type], dataInfoType)
    logger.verbose(`updateDataInfoType: ${JSON.stringify(dataInfoType)} to update`)
    this.saveDataInfo(dataInfo)
    return dataInfo
  }).catch((err) => {
    logger.err(`updateDataInfoType: ${err}`)
  })
}

datamanager.getWikiDataRaw = function (opts) {
  return readFileAsync(`./data/raw/${opts.page}.html`, 'utf8')
    .then((rawData) => {
      const response = {text: {}}
      response.text['*'] = rawData

      return response
    })
}

datamanager.saveWikiDataRAW = function (wikiDataRaw, opts) {
  return writeFileAsync(`./data/raw/${opts.page}.html`, wikiDataRaw)
    .then((writeRes) => {
      logger.verbose(`saveWikiDataRAW: data/raw/${opts.page}.html saved`)
    }).then((res) => {
      this.updateDataInfoType({raw: true}, opts.type)
    }).catch((err) => {
      logger.err(`saveWikiDataRAW: ${err}`)
    })
}

datamanager.checkIfSaveWikiDataRAW = function (wikiDataRaw, opts) {
  return datamanager.getDataInfo().then((dataInfo) => {
    const raw = dataInfo[opts.type].raw
    if (!raw) {
      this.saveWikiDataRAW(wikiDataRaw, opts)
    }
  }).catch((err) => {
    logger.err(`checkIfSaveWikiDataRAW: ${err}`)
  })
}

datamanager.getWikiDataJSON = function (opts) {
  return readFileAsync(`./data/json/${opts.page}.json`, 'utf8')
    .then((rawData) => {
      return JSON.parse(rawData)
    })
}

datamanager.saveWikiDataJSON = function (parseDwikiData, opts) {
  parseDwikiData.lastupdate = new Date()
  parseDwikiData.length = parseDwikiData.list.length

  return writeFileAsync(`./data/json/${parseDwikiData.title}.json`, JSON.stringify(parseDwikiData, null, 4))
    .then((writeRes) => {
      logger.verbose(`saveWikiDataJSON: data/json/${parseDwikiData.title}.json saved`)
    }).then((res) => {
      this.updateDataInfoType({json: true}, opts.type)
    }).catch((err) => {
      logger.err(`saveWikiDataJSON: ${err}`)
    })
}

module.exports = datamanager
