const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bakSql_3306',
  database: 'livredor'
})

connection.connect()

// J'exporte la connexion pour pouvoir la réutiliser partout
module.exports = connection
