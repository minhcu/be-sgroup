// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql')
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})

connection.connect((err) => {
    if (err) {
        // eslint-disable-next-line no-console
        console.error(`error connecting: ${err.stack}`)
        return
    }
    // eslint-disable-next-line no-console
    console.log(`connected as id ${connection.threadId}`)
})

module.exports = connection
