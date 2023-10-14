const express = require('express')
const { saltHash, randomPassword } = require('../helpers/hash')
const {
    getOne, deleteOne, updateOne, getMany, insert,
} = require('../helpers/knex')
const { validateToken } = require('../middlewares/tokenValidate')

const router = express.Router()
const { validateUser } = require('../middlewares')

function validateRole(req, res, next) {
    if (res.locals.decodedJWT.username !== 'assmin') return res.status(403).json({
        code: 403,
        error: 'Permisson denided',
    })

    return next()
}

// eslint-disable-next-line consistent-return
function handleResponse(res, data, err, sent) {
    if (err) return res.status(500).json({
        code: 500,
        err: 'Internal Server Error',
    })

    if (data) return res.status(sent.code).json(sent)
}

router
    .get('/', validateToken, async (req, res) => {
        const [data, err] = await getMany('users', req.query.limit, req.query.page, req.query.query ?? req.query.q, true)

        handleResponse(res, data, err, {
            code: 200,
            data: {
                data,
            },
        })
    })

router
    // eslint-disable-next-line consistent-return
    .post('/add', validateRole, async (req, res) => {
        const {
            username, name, gender, age,
        } = req.body
        let { password } = req.body
        const [duplicatedUser, duplicatedError] = await getOne('users', 'username', username)
        // eslint-disable-next-line max-len
        if (duplicatedUser || duplicatedError) return handleResponse(res, duplicatedUser, duplicatedError, {
            code: 409,
            err: 'User already exist',
        })

        if (!password) password = randomPassword()
        const { hashedPassword, salt } = saltHash(password)

        const d = new Date()
        const newUser = {
            username,
            password: hashedPassword,
            salt,
            name: name || username,
            gender: gender || null,
            age: age || null,
            createdAt: d.toISOString().slice(0, 19).replace('T', ' '),
            createdBy: res.locals.decodedJWT.id,
        }

        const [insertData, insertErr] = await insert('users', newUser)
        return handleResponse(res, insertData, insertErr, {
            code: 200,
            data: {
                message: 'User created',
                password,
            },
        })
    })

router
    // eslint-disable-next-line consistent-return
    .get('/:id', async (req, res) => {
        const [user, err] = await getOne('users', 'id', req.params.id)
        handleResponse(res, user, err, {
            code: 200,
            data: {
                data: user,
            },
        })
        if (!user) return res.status(404).json({
            code: 404,
            err: 'User not found',
        })
    })
    // eslint-disable-next-line consistent-return
    .delete('/:id', validateToken, async (req, res) => {
        const [user, err] = await getOne('users', 'id', req.params.id)

        handleResponse(res, !user, err, {
            code: 404,
            error: 'User not found',
        })

        const { username } = res.locals.decodedJWT
        if (username !== 'assmin') return res.status(403).json({
            code: 403,
            error: 'Permission denided',
        })

        const [deletedUser, deletedError] = await deleteOne('users', 'id', req.params.id)
        handleResponse(res, true, deletedError, {
            code: 200,
            data: {
                message: 'User deleted',
                deletedUser,
            },
        })
    })
    .put('/:id', validateToken, validateUser, async (req, res) => {
        const {
            name, age, gender, email,
        } = req.body
        const putData = {}
        if (name) putData.name = name
        if (age) putData.age = age
        if (gender >= 0) putData.gender = gender
        if (email) putData.email = email

        const [data, err] = await updateOne('users', 'id', req.params.id, putData)
        handleResponse(res, data, err, {
            code: 200,
            data: {
                message: 'User updated',
                data,
            },
        })
    })

module.exports = router
