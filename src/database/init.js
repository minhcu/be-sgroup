const connection = require('./connection')

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
        PRIMARY KEY (id),
        unique (username)
    );
`
const insert = 'INSERT INTO users values (1, "Minh Dong", 1, 18), (2, "Minh Cu", 0, 15);'

connection.query(
    create,
    (err, res) => {
        if (res) {
            connection.query(
                insert,
                (insertErr, insertRes) => {
                    // eslint-disable-next-line no-console
                    if (insertRes) { console.log('Success') }
                },
            )
        }
    },
)
