const express = require('express')
const webtoken = require('jsonwebtoken')
const db = require('../database/connection')
const { saltHash } = require('./helpers/hash')
const { validateRegister, validateLogin } = require('../middlewares')
require('dotenv').config() // App can't read .env file without this line althought it is called in app.js

const router = express.Router()

router.post('/register', validateRegister, async (req, res) => {
    const {
        username,
        password,
        email,
        gender,
        name,
        age,
    } = req.body

    await db.query(
        'SELECT username from users where username = ?',
        username,
        // eslint-disable-next-line consistent-return
        (err, data) => {
            if (err) return res.status(500).json('Internal Server Error')
            if (data.length) return res.status(409).json('Username already exists')
        },
    )

    const { hashedPassword, salt } = saltHash(password)

    db.query(
        `INSERT into users (username, password, salt, name, age, gender, email)
         values (?, ?, ?, ?, ?, ?, ?)
        `,
        [username, hashedPassword, salt, name, age, gender, email],
        (err) => {
            if (err) return res.status(500).json('Internal Server Error')
            return res.status(201).json('User created')
        },
    )
})

router.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body
    db.query(
        'SELECT * from users where username = ?',
        username,
        (err, data) => {
            if (err) { return res.status(500).json('Internal Server Error') }
            if (!data.length) { return res.status(404).json('User not found') }
            const { salt } = data[0]
            const { hashedPassword } = saltHash(password, salt)
            if (hashedPassword !== data[0].password) {
                return res.status(401).json('Input incorrect')
            }
            const token = webtoken.sign({ id: data[0].id }, process.env.SECRET_KEY)
            return res.status(200).json({ token })
        },
    )
})

module.exports = router
