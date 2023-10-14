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
async function getMany(tableName, limit = 10, page = 0, query, getCount) {
    let offset = 0
    if (page > 1) offset = limit * (page - 1)
    query = query ? `%${query}%` : '%%'

    try {
        let total
        const items = await knex.select().from(tableName).limit(limit).offset(offset)
        // NOTEs: This should be dynamic
        // eslint-disable-next-line func-names
            .where(function () {
                this.where('username', 'like', query)
                    .orWhere('name', 'like', query)
                    .orWhere('age', 'like', query)
                    .orWhere('email', 'like', query)
            })
        if (getCount) {
            total = await knex.select().from(tableName).count()
                // NOTEs: This should be dynamic
                // eslint-disable-next-line func-names
                .where(function () {
                    this.where('username', 'like', query)
                        .orWhere('name', 'like', query)
                        .orWhere('age', 'like', query)
                        .orWhere('email', 'like', query)
                })
            total = total[0]['count(*)']
        }

        return handleResponse({
            items,
            total,
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
