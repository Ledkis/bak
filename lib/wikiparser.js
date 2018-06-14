const config = require('config')
const datamanager = require('../app_api/datamanager')
const moment = require('./my-moment')
const wikiutils = require('./wikiutils')

const wikiparser = {}

const datePlaceRegx = new RegExp(config.get('parsing').wikiDatePlaceRegx)

wikiparser.parseWikiData = function (wikiData, wikiDataInfo){
    if (wikiDataInfo.wikiDataType.includes('monarque_eur'))  // we keep it in case
        wikiData.list.forEach(wikiObj => wikiparser.parseWikiObj(wikiObj, wikiDataInfo))
}

function parseDatePlace(wikiStr){

    let res = {}

    let parseRes = datePlaceRegx.exec(wikiStr) || []

    parseRes.shift() // the first is the full match

    parseRes.forEach(el => {
        if(el){
            if(el.match(/\d/) && !res.birthDate) res.birthDate = convertWikiDate(el)
            else if(!el.match(/\d/) && res.birthDate && !res.deathDate && !res.birthPlace) res.birthPlace = el
            else if(el.match(/\d/) && res.birthDate && !res.deathDate) res.deathDate = convertWikiDate(el)
            else if(!el.match(/\d/) && res.deathDate && ! res.deathPlace) res.deathPlace = el
        }
    })

    return res
}

function convertWikiDate(str){
    let date = undefined

    if(!str || typeof str !== 'string' || str.length === 0) return date

    str = str.replace(/\n/g, ' ')          // remove \n
            .replace(/(\d+)\/\d+/, '$1')   // remove 1789/1790 case: select 1789
            .replace(/(\d+) ou \d+/, '$1') // remove 1789 ou 1790 case: select 1789
            .trim()

    let len = str.split(' ').length
    if(len === 1){
        date = moment(str, 'YYYY')
    } else if(len === 2){
        date = moment(str, 'MMMM YYYY')
    } else if(len >= 3){
        date = moment(str, 'DD MMMM YYYY')
    }

    if(!date || !date.isValid()) date = undefined

    return date
}

/**
* Depends on the attibutes given by wikipedia
*/
wikiparser.parseWikiObj = function (wikiObj, wikiDataInfo) {
    
    let nom = wikiObj._Nom

    // nom
    if(nom){
        let nameInfo = nom.split('\n')
        wikiObj.name = nameInfo[0].trim()
        if(nameInfo[1] && !nameInfo[1].match(/[\(\)]/)) wikiObj.surname = nameInfo[1].replace(/[\«\»]/g, '').trim()
    }

    // date & place
    let birthDateKey = wikiutils.getWikiKey('birthDate', wikiObj)  
    let deathDateKey = wikiutils.getWikiKey('deathDate', wikiObj)  

    if(birthDateKey) wikiObj.birthDate = convertWikiDate(wikiObj[birthDateKey])
    if(deathDateKey) wikiObj.deathDate = convertWikiDate(wikiObj[deathDateKey])

    if(!wikiObj.birthDate && !wikiObj.deathDate && nom){
        let parseRes = parseDatePlace(nom)
        Object.keys(parseRes).forEach(key => wikiObj[key] = parseRes[key])
    }

    try {
        if(wikiObj.birthDate && wikiObj.deathDate) wikiObj.lifeSpan = moment.duration(wikiObj.deathDate.diff(wikiObj.birthDate)).asYears()
    } catch(err){
        err
    }

    // reignStart
    let reignStartKey = wikiutils.getWikiKey('reignStart', wikiObj)  
    if(reignStartKey){
        let reignStart = wikiObj[reignStartKey].replace('\n', ' ').trim()
        wikiObj.reignStart = convertWikiDate(reignStart)
    }

    // reignEnd
    let reignEndKey = wikiutils.getWikiKey('reignEnd', wikiObj)  
    if(reignEndKey){
        let reignEnd = wikiObj[reignEndKey].replace('\n', ' ').trim()
        wikiObj.reignEnd = convertWikiDate(reignEnd)
    }

    if(wikiObj.reignStart && wikiObj.reignEnd) wikiObj.reignSpan = moment.duration(wikiObj.reignEnd.diff(wikiObj.reignStart)).asYears()
}

module.exports = wikiparser