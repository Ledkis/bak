const MongoClient = require('mongodb').MongoClient
const config = require('config')
const datamanager = require('../datamanager')
const logger = require('../../lib/my-winston')(__filename, 'verbose')

const url = config.get('dbUrl')

init()

function init(){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        logger.err(err)
      } else {

        const dbo = db.db("bak")

        deleteCollections(dbo)
          .then(() => {
            return createCollectionsFromJSON(dbo)        
          })
          .then(() => {
            db.close()
            logger.info(`init: end`)        
          })
          .catch(err => {
            db.close()
            logger.err(err)        
          })
        }
    })
  })
}

function deleteCollections(dbo){
  return new Promise((resolve, reject) => {
    dbo.listCollections().toArray((err, collInfos) => {

      const promises = []
      const collectionsToDelete = []
      collInfos.forEach((collection) => {

        collectionsToDelete.push(collection.name)
        const p =  new Promise((dropResolve, reject) => {
          dbo.collection(collection.name).drop(function(err, delOK) {
            if (err) throw err
            if (delOK) logger.info(`Collection ${collection.name} deleted`)
            dropResolve()
          })
        })
        .catch(err => logger.err(err))

        promises.push(p)

      })
      
      Promise.all(promises)
      .then(() => {
        logger.info(`deleteCollections: end`)
        resolve()
      })
      .catch(err => {
        logger.err(err)
        reject(err)
      })

      logger.info(`deleteCollections: collections to delete: ${JSON.stringify(collectionsToDelete)}`)
    })
  })
}

function createCollectionsFromJSON(dbo){
  return new Promise((resolve, reject) => {
    const promises = []
    const collectionsToCreate = []
    const dataInfo = datamanager.dataInfo

    Object.keys(dataInfo.wikiData).forEach((dataId) => {

      collectionsToCreate.push(dataId)

      const p =  new Promise((resolve, reject) => {
        dbo.createCollection(dataId, function(err, res) {
          if (err) throw err
          logger.info(`Collection ${dataId} created`)
          resolve()
        })
      })
      .then(() => {
        const page = dataInfo.wikiData[dataId].page
        return datamanager.getWikiDataJSON(page)
      })
      .then((wikidata) => {
        return new Promise((resolve, reject) => {
          dbo.collection(dataId).insertMany(wikidata.list, function(err, res) {
            if (err) throw err;
            logger.info(`${res.insertedCount} inserted in collection ${dataId}`)
            resolve()
          });
        })
      })
      .catch(err => logger.err(err))
      
      promises.push(p)
    })

    Promise.all(promises)
      .then(() => {
        logger.info(`createCollectionsFromJSON: end`)
        resolve()
      })
      .catch(err => {
        logger.err(err)
        reject(err)
      })

    logger.info(`createCollectionsFromJSON: collections to create: ${JSON.stringify(collectionsToCreate)}`)
  })
}