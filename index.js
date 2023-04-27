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
const port = 80         // port 80 is used for the http protocal - week 07    -   done?

// add routes
// this route serves static files
app.use(express.static('public'))

// this route serves the home page, using code
app.get('/send', async(req, res) => {
    res.send(`<!DOCTYPE html><html><body><A href="/hello.html">Say Hello</A></body></html>`)
})

app.post('/add', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.answerText)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})
app.post('/add/:quizName/1', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.answerText)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})
app.post('/add/:quizName/:count', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.mytext)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})

app.post('/data-entry', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.mytext)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})

app.get('/wheres-my-data', urlencodedParser, async (req, res) => {
    const theData = await db.get("form-data")
    res.send(`<!DOCTYPE html><html><body>Data loaded from Redis is:<P> ${theData}</body></html>`)
})


// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)
app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!

