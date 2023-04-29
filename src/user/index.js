const express = require('express')
const jsonwebtoken = require('jsonwebtoken')
const connection = require('../database/connection')

const router = express.Router()
const { validateUser } = require('../middlewares')

// eslint-disable-next-line no-unused-vars
function validateToken(req, res, next) {
    const { authorization } = req.headers
    if (authorization) {
        const token = authorization.split(' ')[1]
        const { key } = req
        try {
            const isValid = jsonwebtoken.verify(token, key, {
                algorithms: ['HS256'],
            })
            if (isValid) next()
        } catch (error) {
            res.status(401).json({
                message: 'Invalid token',
            })
        }
    } else {
        res.status(401).json({
            message: 'Invalid token',
        })
    }
}

router
    .get('/', (req, res) => {
        connection.query(
            'SELECT * from users',
            (err, data) => {
                if (err) return res.status(404).json(err)
                return res.status(200).json(data)
            },
        )
    })
    .post('/', validateToken, validateUser, (req, res) => {
        const { name, gender, age } = req.body
        connection.query(
            'INSERT INTO users (name, gender, age) VALUES (?, ?, ?)',
            [name, gender, age],
            (err, data) => {
                if (err) return res.status(404).json(err)
                return res.status(201).json(data)
            },
        )
    })

router
    .get('/:id', (req, res) => {
        connection.query(
            'SELECT * from users where id = ?',
            req.params.id,
            (err, data) => {
                if (err) return res.status(404).json(err)
                if (!data.length) return res.status(404).send('User not found')
                return res.status(200).json(data[0])
            },
        )
    })
    .delete('/:id', (req, res) => {
        connection.query(
            'DELETE from users where id = ?',
            req.params.id,
            (err) => {
                if (err) return res.status(404).json(err)
                return res.status(204).send()
            },
        )
    })
    .put('/:id', validateToken, validateUser, (req, res) => {
        const { name, gender, age } = req.body
        const id = Number(req.params.id)
        connection.query(
            'UPDATE users SET name = ?, gender = ?, age = ? WHERE id = ?',
            [name, gender, age, id],
            (err) => {
                if (err) return res.status(404).json(err)
                return res.status(204).send()
            },
        )
    })

module.exports = router
