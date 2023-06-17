// This file using for testing purpose

const knex = require('../database/connection')

const select = '*'

const where = null
const obj = {
    table: 'users',
    select,
    where,
}

function getOne(o) {
    knex(o.table)
        .select(obj.select)
        .where(db => {
            if (o.where) db.where(o.where)
        })
        .first()
        .then(data => console.log(data))
        .catch(err => console.error(err))
}

getOne(obj)
