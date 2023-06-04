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

// eslint-disable-next-line consistent-return
async function getMany(tableName, limit = 2, offset = 0) {
    // if (!offset) {
    //     try {
    //         const data = await knex.select.from(tableName).limit(limit)
    //         return handleResponse(data, undefined)
    //     } catch (err) {
    //         return handleResponse(undefined, err)
    //     }
    // }
    try {
        const data = await knex.select().from(tableName).limit(limit).offset(offset)
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
