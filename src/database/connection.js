// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

// eslint-disable-next-line import/no-extraneous-dependencies
const connection = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
})

module.exports = connection
