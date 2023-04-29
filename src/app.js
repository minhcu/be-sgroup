const express = require('express')
// const morgan = require('morgan')

const app = express()
const port = 3000

// const userRoute = require('./user')
const authRoute = require('./auth')

app.use(express.json())
// app.use(morgan('combined'))
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRoute)
// app.use('/user', userRoute)

app.use('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`)
})
