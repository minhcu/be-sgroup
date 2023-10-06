require('dotenv').config()
// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql2')
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})

connection.connect(err => {
    if (err) {
        // eslint-disable-next-line no-console
        console.error(`error connecting: ${err.stack}`)
        return
    }
    // eslint-disable-next-line no-console
    console.log(`connected as id ${connection.threadId}`)
})

const create = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT,
        username VARCHAR(255),
        password VARCHAR(255),
        salt VARCHAR(255),
        name VARCHAR(255),
        age INT unsigned,
        gender BOOLEAN,
        email VARCHAR(255),
        passwordResetToken VARCHAR(255),
        passwordResetExpiration DATETIME,
        createdAt DATETIME,
        createdBy INT,
        PRIMARY KEY (id),
        FOREIGN KEY (createdBy) REFERENCES users(id),
        unique (username)
    );
`
const insert = 'INSERT INTO users(id, username, password, name) values (1, "assmin", "assmin", "assmin")'

connection.query(
    create,
    (err, res) => {
        if (res) connection.query(
            insert,
            (insertErr, insertRes) => {
                // eslint-disable-next-line no-console
                if (insertRes) console.log('Success')
                if (insertErr) console.log(insertErr)
            },
        )
    },
)
