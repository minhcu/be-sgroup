const express = require('express')
const app = express()
const port = 3000

const userRoute = require('./src/user')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.use('/user', userRoute)

app.use('/', (req, res) => {
  return res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
