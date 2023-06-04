// eslint-disable-next-line import/no-extraneous-dependencies
// const mysql = require('mysql')
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

// eslint-disable-next-line import/no-extraneous-dependencies
const connection = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
})

module.exports = connection
