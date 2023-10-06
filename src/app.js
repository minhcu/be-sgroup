const express = require('express')
const cors = require('cors')
// const crypto = require('crypto')

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
// })
// const morgan = require('morgan')

const { validateToken } = require('./middlewares/tokenValidate')

const app = express()
const port = 3000

const userRoute = require('./user')
const authRoute = require('./auth')
const pollRoute = require('./poll')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

function key(req, res, next) {
    req.key = 'secret'
    next()
}

app.use('/auth', key, authRoute)
app.use('/users', key, validateToken, userRoute)
app.use('/polls', key, validateToken, pollRoute)

app.use('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`)
})
