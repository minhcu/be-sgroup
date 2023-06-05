const express = require('express')
const { saltHash, randomPassword } = require('../helpers/hash')
const {
    getOne, deleteOne, updateOne, getMany, insertOne,
} = require('../helpers/knex')
const { validateToken } = require('../middlewares/tokenValidate')

const router = express.Router()
const { validateUser } = require('../middlewares')

function validateRole(req, res, next) {
    if (res.locals.decodedJWT.username !== 'assmin') {
        return res.status(403).json({
            code: 403,
            error: 'Permisson denided',
        })
    }
    return next()
}

// eslint-disable-next-line consistent-return
function handleResponse(res, data, err, json) {
    if (err) {
        return res.status(500).json({
            code: 500,
            err: 'Internal Server Error',
        })
    }
    if (data) return res.status(json.code).json(json)
}

router
    .get('/', async (req, res) => {
        const [data, err] = await getMany('users', req.query.limit, req.query.page, req.query.query ?? req.query.q)
        handleResponse(res, data, err, {
            code: 200,
            data: {
                data,
            },
        })
    })

router
    // eslint-disable-next-line consistent-return
    .post('/add', validateToken, validateRole, async (req, res) => {
        const {
            username, name, gender, age,
        } = req.body
        let { password } = req.body
        let createdBy = 0
        const [duplicatedUser, duplicateError] = await getOne('users', 'username', username)
        handleResponse(res, duplicatedUser, duplicateError, {
            code: 409,
            err: 'User already exist',
        })

        const [adminUser, err] = await getOne('users', 'username', res.locals.decodedJWT.username)
        handleResponse(res, undefined, err)

        createdBy = adminUser.id
        if (!password) {
            password = randomPassword()
        }
        const { hashedPassword, salt } = saltHash(password)

        const newUser = {
            username,
            password: hashedPassword,
            salt,
            name: name ?? username,
            gender: gender ?? null,
            age: age ?? null,
            createdBy,
        }

        const [data, insertErr] = await insertOne('users', newUser)
        handleResponse(res, data, insertErr, newUser, {
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
        if (!user) {
            return res.status(404).json({
                code: 404,
                err: 'User not found',
            })
        }
    })
    // eslint-disable-next-line consistent-return
    .delete('/:id', validateToken, async (req, res) => {
        const [user, err] = await getOne('users', 'id', req.params.id)

        handleResponse(res, !user, err, {
            code: 404,
            error: 'User not found',
        })

        const { username } = res.locals.decodedJWT
        if (user.username !== username) {
            if (username !== 'assmin') {
                return res.status(403).json({
                    code: 403,
                    error: 'Permission denided',
                })
            }
        }

        const [deletedUser, deletedError] = await deleteOne('users', 'id', req.params.id)
        handleResponse(res, true, deletedError, {
            data: {
                message: 'success',
                deletedUser,
            },
        })
    })
    .put('/:id', validateToken, validateUser, async (req, res) => {
        const { name, gender, age } = req.body
        const [data, err] = await updateOne('users', 'id', req.params.id, {
            name,
            gender,
            age,
        })
        handleResponse(res, data, err, {
            data: {
                message: 'success',
                data,
            },
        })
    })

module.exports = router
