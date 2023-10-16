/* eslint-disable camelcase */
const express = require('express')
const knex = require('../database/connection')
const { handleResponse } = require('../helpers/res')
const {
    getOne, getMany, deleteOne, updateOne,
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
        const col = [
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

        const [data, err] = await getMany('polls', {
            col,
            limit: req.query.limit,
            page: req.query.page,
            query: req.query.q || req.query.query,
            queryCol: ['polls.name', 'polls.detail'],
        })

        handleResponse(res, data, err, {
            code: 200,
            data,
        })
    })
    .get('/:id', validateToken, async (req, res) => {
        const col = [
            'polls.id',
            'polls.name',
            'polls.detail',
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

        const [data, err] = await getOne('polls', {
            col,
            condition: {
                'polls.id': req.params.id,
            },
        })

        handleResponse(res, data, err, {
            code: 200,
            data,
        })
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
    // Poll must exist to vote
    const [poll, pollErr] = await getOne('polls', {
        col: ['id'],
        condition: {
            id: req.params.id,
        },
        method: 'post',
    })
    if (!poll || pollErr) return handleResponse(res, true, pollErr, {
        code: 404,
        message: 'Poll not found',
    })

    // Option must exist to vote
    const [o, oErr] = await getOne('poll_options', {
        col: ['id'],
        condition: {
            id: req.params.oid,
        },
    })
    if (!o || oErr) return handleResponse(res, true, oErr, {
        code: 404,
        message: 'Option not exist',
    })

    const condition = {
        poll_id: req.params.id,
        option_id: req.params.oid,
        user_id: res.locals.decodedJWT.id,
    }

    knex('user_poll_options').select('is_voted').where(condition).first()
        .then(data => {
            const insert = {
                ...condition,
                is_voted: data ? !data.is_voted : 1,
            }
            return knex('user_poll_options').insert(insert)
                .onConflict(['poll_id', 'option_id', 'user_id'])
                .merge({
                    is_voted: insert.is_voted ? 1 : 0,
                })
        })
        .then(data => res.status(200).json({
            code: 200,
            data,
        }))
        .catch(() => res.status(500).json('Internal Server Error'))
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
