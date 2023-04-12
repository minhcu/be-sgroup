// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql')

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    database: 'be',
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
