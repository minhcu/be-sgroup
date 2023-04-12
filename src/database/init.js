const connection = require('./connection')

const create = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT,
        fullName VARCHAR(255) NOT NULL,
        gender BOOLEAN NOT NULL,
        age INT NOT NULL,
        PRIMARY KEY (id),
        CHECK (age > 0)
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
