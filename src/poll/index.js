const express = require('express')
const knex = require('../database/connection')
const { handleResponse } = require('../helpers/res')
const { getOne, deleteOne, updateOne } = require('../helpers/knex')
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
    .get('/:id', async (req, res) => {
        const colName = [
            'polls.id',
            'polls.name',
            'polls.detail',
            // á
            knex.raw(`
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    "id", poll_options.id,
                    "label", poll_options.label,
                    'users', (
                        SELECT 
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id', users.id,
                                    'name', users.name,
                                    'is_voted', user_poll_options.is_voted
                                )
                            )
                        FROM 
                            users
                        inner join 
                            user_poll_options on user_poll_options.user_id = users.id
                        where 
                            user_poll_options.poll_id = polls.id and user_poll_options.option_id = poll_options.id
                    )
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

                poll.options = JSON.parse(poll.options)
                return res.status(200).json(poll)
            })
        // eslint-disable-next-line no-return-assign
            .catch(err => res.status(200).json(err))
    })
    .delete('/:id', async (req, res) => {
        const [data, err] = await deleteOne('polls', 'id', req.params.id)
        handleResponse(res, true, err, {
            code: 200,
            message: 'success',
            data,
        })
    })

router
    // eslint-disable-next-line consistent-return
    .post('/:id/add', async (req, res) => {
        const option = req.body
        option.poll_id = req.params.id

        const [poll, pollErr] = await getOne('polls', 'id', option.poll_id)
        if (!poll || pollErr) return handleResponse(res, true, pollErr, {
            code: 404,
            message: 'Poll not found',
        })

        await knex('poll_options').where(option)
            .then(() => res.status(200).json({
                message: 'Option already exist',
            }))
            .catch(() => res.status(500).json({
                err: 'Internal server error',
            }))

        await knex.insert(option)
            .into('poll_options')
            .then(id => res.status(200).json({
                id,
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
router.post('/:id/vote/:oid', validateToken, async (req, res) => {
    let add = true
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

    await knex('user_poll_options').where({
        poll_id: req.params.id,
        option_id: req.params.oid,
        user_id: res.locals.userToken.id,
    })
        .then(data => {
            if (!data.length) return
            add = false
            const newVoteData = data[0].is_voted ? 0 : 1
            knex('user_poll_options').where({
                poll_id: req.params.id,
                option_id: req.params.oid,
                user_id: res.locals.userToken.id,
            })
                .update({
                    is_voted: newVoteData,
                })
                .then(newData => res.status(200).json(newData))
                .catch(err => res.status(200).json(err))
        })
        .catch(err => res.status(200).json(err))

    if (add) knex('user_poll_options').insert({
        poll_id: req.params.id,
        option_id: req.params.oid,
        user_id: res.locals.userToken.id,
        is_voted: 1,
    })
        .then(data => res.status(200).json(data))
        .catch(err => res.status(200).json(err))
})

router.post('/add', validatePoll, (req, res) => {
    const { poll, options } = req.body
    // Using trx as a query builder:
    knex.transaction(trx => trx
        .insert(poll)
        .into('polls')
        .then(ids => {
            // console.log('poll ID: ', ids)
            // eslint-disable-next-line no-return-assign, prefer-destructuring, no-param-reassign
            options.forEach(o => o.poll_id = ids[0])
            return trx('poll_options').insert(options)
        }))
        .then(inserts => res.status(200).json({
            inserts,
        }))
        .catch(error => res.status(200).json({
            error,
        }))
})

module.exports = router
