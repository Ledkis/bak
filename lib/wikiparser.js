const config = require('config')
const datamanager = require('../app_api/datamanager')
const moment = require('./my-moment')

    const wikiparser = {}

wikiparser.parseWikiData = function (wikiData, wikiDataInfo){
    wikiData.list.forEach(wikiObj => wikiparser.parseMonarqueFr(wikiObj, wikiDataInfo))
}

// MonarquesFr

function convertWikiDate(str){
    if(!str || typeof str !== 'string' || str.length === 0) return

    let len = str.split(' ').length
    if(len === 1){
        if(str.includes('/')) str = str.split('/')[0] // 1789/1790 case: we take the first by default
        return moment(str, 'YYYY')
    } else if(len === 2){
        return moment(str, 'MMMM YYYY')
    } else if(len === 3){
        if(str.includes('ou')){
            str = str.split(' ou ')[0] // 1789 ou 1790 case: we take the first by default
            return moment(str, 'YYYY')
        } else {
            return moment(str, 'DD MMMM YYYY')
        }
    }
}

wikiparser.parseMonarqueFr = function (wikiObj, wikiDataInfo) {
    
  let nom = wikiObj._Nom

  // nom
  if(nom){
      let nameInfo = nom.split('\n')
      wikiObj.name = nameInfo[0]
    if(nameInfo[1] && !nameInfo[1].match(/[\(\)]/)) wikiObj.surname = nameInfo[1].replace(/[\»\«]/)
  }
  
  // date
  if(nom && wikiDataInfo.dateRegx){
    let dateRegx = new RegExp(wikiDataInfo.dateRegx)
    let dates = dateRegx.exec(nom) || []
    dates.splice(0, 1)
    dates = dates.filter(el => el !== undefined)
    dates.push(...new Array(2-dates.length).fill())

    wikiObj.born = convertWikiDate(dates[0])
    wikiObj.dead = convertWikiDate(dates[1])

    if(wikiObj.born && wikiObj.dead) wikiObj.lifeSpan = moment.duration(wikiObj.dead.diff(wikiObj.born)).asYears()
  }

  // début du règne

  if(wikiObj['_Début du règne']){
    let reignStart = wikiObj['_Début du règne'].replace('\n', ' ')
    wikiObj.reignStart = convertWikiDate(reignStart)
  }

  // _Fin du règne

  if(wikiObj['_Fin du règne']){
    let reignEnd = wikiObj['_Fin du règne'].replace('\n', ' ')
    wikiObj.reignEnd = convertWikiDate(reignEnd)
  }
}

module.exports = wikiparser