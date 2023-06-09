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
const pollRoute = require('./poll')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function key(req, res, next) {
    req.key = 'secret'
    next()
}

app.use('/auth', key, authRoute)
app.use('/users', key, userRoute)
app.use('/polls', key, pollRoute)

app.use('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`)
})
