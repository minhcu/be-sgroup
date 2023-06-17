/* eslint-disable no-param-reassign */
const knex = require('../database/connection')

function handleResponse(data, err) {
    return [data, err]
}

async function getOne(tableName, colName, condition) {
    try {
        const data = await knex.select().from(tableName).where(colName, condition).first()
        return handleResponse(data, undefined)
    } catch (err) {
        return handleResponse(undefined, err)
    }
}

// eslint-disable-next-line consistent-return, default-param-last
async function getMany(tableName, limit = 10, page = 0, query) {
    if (typeof +limit !== 'number' || typeof +page !== 'number' || limit < 0 || page < 0) return handleResponse(undefined, true)
    let offset = 0
    if (page > 1) offset = limit * (page - 1)

    try {
        let data
        if (query.toString()) {
            query = `%${query}%`
            data = await knex.select().from(tableName).limit(limit).offset(offset)
                // NOTEs: This should be dynamic
                // eslint-disable-next-line func-names
                .where(function () {
                    this.where('username', 'like', query)
                        .orWhere('name', 'like', query)
                        .orWhere('age', 'like', query)
                        .orWhere('email', 'like', query)
                })
        } else data = await knex.select().from(tableName).limit(limit).offset(offset)

        return handleResponse(data, undefined)
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

async function insertOne(tableName, dataObj) {
    try {
        const data = await knex.from(tableName).insert(dataObj)
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
    insertOne,
}
