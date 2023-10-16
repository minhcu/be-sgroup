/* eslint-disable no-param-reassign */
const knex = require('../database/connection')

function handleResponse(data, err) {
    return [data, err]
}

async function getOne(table, config = {}) {
    const {
        col = '*', condition, method,
    } = config
    let getOneQuery = knex.select(col).from(table).where(condition)
    if (table === 'polls' && method !== 'post') getOneQuery = getOneQuery.join('poll_options', 'polls.id', 'poll_options.poll_id').groupBy('polls.id')
    try {
        const data = await getOneQuery.first()
        return handleResponse(data, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

// eslint-disable-next-line consistent-return, default-param-last
async function getMany(table, config = {}) {
    let offset = 0
    const {
        limit = 10, page = 1, col = '*', queryCol = '*',
    } = config
    let { query } = config
    if (page > 1) offset = limit * (page - 1)
    query = query ? `%${query}%` : '%%'

    let itemsQuery = knex.select(col).from(table).limit(limit).offset(offset)
        .where(builder => {
            if (queryCol === '*') builder.where({})
            else queryCol.forEach(colName => {
                builder.orWhere(colName, 'like', query)
            })
        })
    switch (table) {
    case 'polls':
        itemsQuery = itemsQuery.leftJoin('users', 'polls.createdBy', 'users.id').groupBy('polls.id')
        break
    default:
        break
    }
    const countQuery = knex.select().from(table).count()

    try {
        const [items, total] = await Promise.all([itemsQuery, countQuery])

        return handleResponse({
            items,
            total: total[0]['count(*)'],
        }, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

async function deleteOne(tableName, colName, condition) {
    try {
        const data = await knex.delete().from(tableName).where(colName, condition)
        return handleResponse(data, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

async function updateOne(tableName, colName, condition, userData) {
    try {
        const data = await knex.from(tableName).where(colName, condition).update(userData)
        return handleResponse(data, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

async function insert(tableName, dataObj) {
    try {
        const data = await knex(tableName).insert(dataObj)
        return handleResponse(data, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

module.exports = {
    getOne,
    getMany,
    deleteOne,
    updateOne,
    insert,
}
