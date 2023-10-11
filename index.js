require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/books', require('./API/books'))

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});