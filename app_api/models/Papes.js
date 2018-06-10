const connection = require('./db')
const moment = require('../../lib/my-moment')

/*
"attribs": [
    "Élus au Ier siècle",
    "Papes de Rome\n(seuls considérés aujourd’hui comme légitimes par l’Église catholique romaine)"
],
"No ": "1",
"Portrait": "",
"Nom de règne": "saint Pierre\nsanctus Petrus",
"Pontificat": "33[citation nécessaire] – 64/67",
"Nom d’origine": "Simon",
"Naissance": "à Bethsaïde",
"Remarques": ""
*/
class Papes {
  constructor (wikiData) {
    this.attribs = wikiData.attribs
  }

  get content () {
    return this.row.content
  }

  get id () {
    return this.row.id
  }

  get created_at () {
    return moment(this.row.created_at)
  }

  static create (content, cb) {
    // https://www.npmjs.com/package/mysql
    connection.query('INSERT INTO message SET content = ?, created_at = ?', [content, new Date()], function (error, results, fields) {
      if (error) throw error
      cb(results)
    })
  }

  static all (cb) {
    connection.query('SELECT * FROM message', (err, rows) => {
      if (err) throw err
      cb(rows.map((row) => new Message(row)))
    })
  }

  static find (id, cb) {
    // https://www.npmjs.com/package/mysql
    connection.query('SELECT * FROM message WHERE id = ? LIMIT 1', [id], function (error, rows) {
      if (error) throw error
      cb(new Message(rows[0]))
    })
  }
}

module.exports = Message
