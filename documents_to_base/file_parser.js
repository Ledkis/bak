const fs = require('fs')


const mysql = require('mysql')

var db = mysql.createConnection({
  host: 'localhost',
  database: 'bak_development',
  user: 'dev',
  password: 'dev'
})

db.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})



