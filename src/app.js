const express = require('express')
// const crypto = require('crypto')

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
// })
// const morgan = require('morgan')

const app = express()
const port = 3000

const userRoute = require('./user')
const authRoute = require('./auth')

app.use(express.json())
// app.use(morgan('combined'))
app.use(express.urlencoded({ extended: true }))

function key(req, res, next) {
    // req.privateKey = privateKey.toString('base64')
    // req.publicKey = publicKey.toString('base64')
    req.key = 'secret'
    next()
}

app.use('/auth', key, authRoute)
app.use('/users', key, userRoute)

app.use('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`)
})
