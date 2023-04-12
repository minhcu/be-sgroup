const express = require('express')

const app = express()
const port = 3000

const userRoute = require('./user')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/user', userRoute)

app.use('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${port}`)
})
