const express = require('express')
const webtoken = require('jsonwebtoken')
const db = require('../database/connection')
const { saltHash } = require('../helpers/hash')
const { validateRegister, validateLogin } = require('../middlewares')
const { mailService } = require('../services/mail.service')
const { validateEmailPass } = require('../middlewares')
const { validateToken } = require('../middlewares/tokenValidate')

const router = express.Router()

router.post('/reset-password', validateEmailPass, (req, res) => {
    const { email, passwordResetToken, newPassword } = req.body
    // eslint-disable-next-line consistent-return
    db.query('SELECT * from users where email = ? and passwordResetToken = ?', [email, passwordResetToken], (err, data) => {
        if (err) return res.status(500).json('Internal Server Error')
        if (!data.length) return res.status(400).json('User not found')

        const { passwordResetExpiration } = data[0]
        const expirationDate = new Date(passwordResetExpiration)
        if (expirationDate < Date.now()) return res.status(400).json('Token expired')
    })

    const { hashedPassword, salt } = saltHash(newPassword)

    db.query('UPDATE users set password = ?, salt = ? where email = ? and passwordResetToken = ?', [hashedPassword, salt, email, passwordResetToken], (err, data) => {
        if (err || !data.affectedRows) return res.status(500).json({ err })
        return res.status(201).json({
            message: 'Password changed successfully',
        })
    })
})

router.post('/forgot-password', validateEmailPass, (req, res) => {
    const { email } = req.body

    // eslint-disable-next-line consistent-return
    db.query('SELECT * from users where email = ?', email, (err, data) => {
        if (err) return res.status(500).json('Internal Server Error')
        if (!data.length) return res.status(400).json('User not found')
    })

    const { salt } = saltHash('')
    const expiration = new Date(Date.now() + 10 * 60 * 1000)

    // eslint-disable-next-line consistent-return
    db.query('UPDATE users set passwordResetToken = ?, passwordResetExpiration = ? where email = ?', [salt, expiration, email], err => {
        if (err) return res.status(500).json({ err })
    })

    try {
        mailService.sendMail({
            emailFrom: '',
            emailTo: email,
            emailSubject: 'Password reset token',
            emailText: salt,
        })
        return res.status(200).json({
            status: 'success',
            message: 'Please check your email',
        })
    } catch (error) {
        return res.status(500).json('Internal Server Error')
    }
})

router.post('/register', validateRegister, (req, res) => {
    const {
        username,
        password,
        email,
        gender,
        name,
        age,
    } = req.body

    db.query(
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
        err => {
            if (err) return res.status(500).json('Internal Server Error')
            return res.status(201).json('User created')
        },
    )
})

router.post('/login', validateLogin, async (req, res) => {
    const { username, password } = req.body
    const { key } = req

    const [data, error] = await db.select().from('users').where('username', username)

    if (error) return res.status(500).json({
        code: 500,
        error: 'Internal Server Error',
    })

    if (!data) return res.status(500).json({
        code: 404,
        error: 'User not found',
    })

    if (data.username === 'assmin') {
        if (password !== data.password) return res.status(401).json({
            message: 'Incorrect password',
        })
    } else {
        const { salt } = data
        const { hashedPassword } = saltHash(password, salt)
        if (hashedPassword !== data.password) return res.status(401).json({
            message: 'Incorrect password',
        })
    }

    const user = data
    const payload = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
    }
    const token = webtoken.sign(payload, key, {
        algorithm: 'HS256',
        // expiresIn: 'never',
        issuer: 'localhost',
    })
    return res.status(200).json({ token, data })
})

router.post('/validate', validateToken)

module.exports = router
