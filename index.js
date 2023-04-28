import express from 'express'
import bodyParser from 'body-parser'
import redis from 'redis'

// make the one and only express object     -   done?
const app = express()

// make a database connection to redis      -   done?
var urlencodedParser = bodyParser.urlencoded({ extended: false})
const db = redis.createClient({
    url: 'redis://localhost:6379'
})
await db.connect()     // if this errors, make sure redis is running    -   done?

// add routes
// this route serves static files
app.use(express.static('public'))

// this route serves the home page, using code
app.post('/add', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.answerText)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})
app.post('/add/:quizName/:count', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.mytext)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})

// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)
app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!

