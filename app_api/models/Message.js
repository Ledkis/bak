const connection = require('./db')
const moment = require('../../lib/my-moment')

class Message {
  constructor (row) {
    this.row = row
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
