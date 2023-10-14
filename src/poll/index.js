const express = require('express')
const knex = require('../database/connection')
const { handleResponse } = require('../helpers/res')
const {
    getOne, deleteOne, updateOne,
} = require('../helpers/knex')
const { validateToken } = require('../middlewares/tokenValidate')

const router = express.Router()

function validatePoll(req, res, next) {
    const { poll, options } = req.body

    return !!poll.name && options.length ? next() : handleResponse(res, true, null, {
        code: 403,
        message: 'Invalid Input',
    })
}

router
    .get('/', validateToken, async (req, res) => {
        const limit = req.query.limit || 10
        const page = req.query.page || 1
        let offset = 0
        const query = req.query.query || '%%'
        if (page > 1) offset = limit * (page - 1)

        const column = [
            'polls.id',
            'polls.name',
            'polls.createdAt',
            knex.raw(`
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        "id", users.id,
                        "username", users.username
                    )
                ) as createdBy
            `),
        ]

        const itemsQuery = knex.select(column).from('polls').limit(limit).offset(offset)
            .leftJoin('users', 'polls.createdBy', 'users.id')
            .where(function () {
                this.where('polls.name', 'like', query)
                    .orWhere('polls.detail', 'like', query)
            })
            .groupBy('polls.id')
        const countQuery = knex.select().from('polls').limit(limit).offset(offset)
            .where(function () {
                this.where('name', 'like', query)
                    .orWhere('detail', 'like', query)
            })
            .count()
        Promise.all([itemsQuery, countQuery])
            .then(([items, count]) => res.status(200).json({
                code: 200,
                data: {
                    items,
                    count: count[0]['count(*)'],
                },
            }))
            .catch(err => res.status(500).json({
                code: 500,
                err,
            }))
    })
    .get('/:id', validateToken, async (req, res) => {
        const colName = [
            'polls.id',
            'polls.name',
            'polls.detail',
            // á
            knex.raw(`
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', poll_options.id,
                    'label', poll_options.label,
                    'is_voted', COALESCE((SELECT is_voted FROM user_poll_options WHERE user_id = ${res.locals.decodedJWT.id} AND option_id = poll_options.id), 0),
                    'users', COALESCE((
                        SELECT 
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id', users.id,
                                    'name', users.name
                                )
                            )
                        FROM 
                            users
                        inner join 
                            user_poll_options on user_poll_options.user_id = users.id
                        where 
                            user_poll_options.poll_id = polls.id and user_poll_options.option_id = poll_options.id and users.id != ${res.locals.decodedJWT.id}
                    ), JSON_ARRAY())
                )
            ) 
            as options
        `),
        ]

        await knex.select(colName)
            .from('polls')
            .join('poll_options', 'polls.id', 'poll_options.poll_id')
            .where('polls.id', req.params.id)
            .groupBy('polls.id')
        // eslint-disable-next-line no-return-assign
            .then(data => {
                const poll = data[0]
                if (!poll) return res.status(404).json({
                    code: 404,
                    message: 'Poll not found',
                })

                return res.status(200).json({
                    data: poll,
                })
            })
        // eslint-disable-next-line no-return-assign
            .catch(err => res.status(200).json(err))
    })
    .delete('/:id', validateToken, async (req, res) => {
        const [data, err] = await deleteOne('polls', 'id', req.params.id)
        handleResponse(res, true, err, {
            code: 200,
            message: 'Poll deleted',
            data,
        })
    })

router
    // eslint-disable-next-line consistent-return
    .post('/:id/add', async (req, res) => {
        const options = req.body
        // eslint-disable-next-line no-return-assign, no-param-reassign
        options.forEach(o => o.poll_id = req.params.id)

        const [poll, pollErr] = await getOne('polls', 'id', req.params.id)
        if (!poll || pollErr) return handleResponse(res, true, pollErr, {
            code: 404,
            message: 'Poll not found',
        })

        await knex.insert(options)
            .into('poll_options')
            .returning('id')
            .then(ids => res.status(200).json({
                ids,
            }))
            .catch(err => res.json(500).json({
                code: 500,
                err,
            }))
    })

router.put('/:id/update/:oid', async (req, res) => {
    const option = req.body
    const [poll, pollErr] = await getOne('polls', 'id', req.params.id)
    if (!poll || pollErr) return handleResponse(res, true, pollErr, {
        code: 404,
        message: 'Poll not found',
    })
    const [o, oErr] = await getOne('poll_options', 'id', req.params.oid)
    if (!o || oErr) return handleResponse(res, true, oErr, {
        code: 404,
        message: 'Option not exist',
    })

    if (o.label === option.label) return res.status(403).json({
        message: 'Option updated',
    })

    const [updatedData, updatedErr] = await updateOne('poll_options', 'id', req.params.oid, option)
    return handleResponse(res, updatedData, updatedErr, {
        code: 200,
        message: 'Option updated test',
        data: updatedData,
    })
})

// eslint-disable-next-line consistent-return
router.post('/:id/vote/:oid', async (req, res) => {
    let add = true

    // Poll must exist to vote
    const [poll, pollErr] = await getOne('polls', 'id', req.params.id)
    if (!poll || pollErr) return handleResponse(res, true, pollErr, {
        code: 404,
        message: 'Poll not found',
    })

    // Option must exist to vote
    const [o, oErr] = await getOne('poll_options', 'id', req.params.oid)
    if (!o || oErr) return handleResponse(res, true, oErr, {
        code: 404,
        message: 'Option not exist',
    })

    // User already voted this option?
    await knex('user_poll_options').where({
        poll_id: req.params.id,
        option_id: req.params.oid,
        user_id: res.locals.decodedJWT.id,
    })
        .then(data => {
            if (!data.length) return
            add = false
            const newVoteData = data[0].is_voted ? 0 : 1
            knex('user_poll_options').where({
                poll_id: req.params.id,
                option_id: req.params.oid,
                user_id: res.locals.decodedJWT.id,
            })
                .update({
                    is_voted: newVoteData,
                })
                .then(newData => res.status(200).json(newData))
                .catch(err => res.status(200).json(err))
        })
        .catch(err => res.status(200).json(err))

    if (add) {
        const insertData = {
            poll_id: req.params.id,
            option_id: req.params.oid,
            user_id: res.locals.decodedJWT.id,
            is_voted: 1,
        }
        knex('user_poll_options').insert(insertData)
            .then(data => res.status(200).json(data))
            .catch(err => res.status(200).json(err))
    }
})

router.delete('/:id/delete/', async (req, res) => {
    const { options } = req.body
    knex.delete().from('poll_options').whereIn('id', options).then(data => res.status(200).json({ data }))
        .catch(err => res.status(200).json({ err }))
})

router.post('/add', validatePoll, (req, res) => {
    const { poll, options } = req.body
    poll.createdBy = res.locals.decodedJWT.id
    const d = new Date()
    poll.createdAt = d.toISOString().slice(0, 19).replace('T', ' ')
    // Using trx as a query builder:
    knex.transaction(trx => trx
        .insert(poll)
        .into('polls')
        .then(ids => {
            // eslint-disable-next-line no-return-assign, prefer-destructuring, no-param-reassign
            options.forEach(o => o.poll_id = ids[0])
            return trx('poll_options').insert(options)
        }))
        // eslint-disable-next-line no-unused-vars
        .then(_ => res.status(200).json({
            code: 200,
            message: 'Poll created',
        }))
        // eslint-disable-next-line no-unused-vars
        .catch(_ => res.status(500).json({
            code: 500,
            err: 'Internal Server Error',
        }))
})

module.exports = router
