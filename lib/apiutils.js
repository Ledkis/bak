const url = require('url')
const config = require('config')
const request = require('request-promise-native')
const logger = require('../lib/my-winston')(__filename)

const apiutils = {}

// TODO: put it in conf file
//const API_URL = 'https://www.gps-coordinates.net/api/'
const API_URL = 'http://maps.googleapis.com/maps/api/geocode/' //json?address=paris&

apiutils.getLocation = function (location){

    let apiKey = config.get('apiKey').google
    let reqUrl = url.format(`http://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&api_key=${apiKey}`)

    //logger.info(`getLocation: ${reqUrl}`)
    return new Promise((resolve, reject) => {
        request(reqUrl)
        .then(res => {
            res = JSON.parse(res)
            if (res.status === 'OK') {
                resolve(res.results[0])
            } else {
                reject(new Error(`${location} ${res.status}`))
            }
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = apiutils
