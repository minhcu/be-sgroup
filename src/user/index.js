const express = require('express')
const connection = require('../database/connection')

const router = express.Router()
const { validateUser } = require('../middlewares')

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
    .post('/', validateUser, (req, res) => {
        const { fullName, gender, age } = req.body
        connection.query(
            'INSERT INTO users (fullName, gender, age) VALUES (?, ?, ?)',
            [fullName, gender, age],
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
    .put('/:id', validateUser, (req, res) => {
        const { fullName, gender, age } = req.body
        const id = Number(req.params.id)
        connection.query(
            'UPDATE users SET fullName = ?, gender = ?, age = ? WHERE id = ?',
            [fullName, gender, age, id],
            (err) => {
                if (err) return res.status(404).json(err)
                return res.status(204).send()
            },
        )
    })

module.exports = router
