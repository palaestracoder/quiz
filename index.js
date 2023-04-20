import express from 'express'
import redis from 'redis'

// make the one and only express object
const app = express()

// make a database connection to redis
const db = redis.createClient({
    url: 'redis://localhost:6379'
})
await db.connect()     // if this errors, make sure redis is running

// add routes
// this route serves static files
app.use(express.static('public'))

// this route serves the home page, using code
app.get('/', async(req, res) => {
    res.send(`<!DOCTYPE html><html><body><A href="/hello.html">Say Hello</A></body></html>`)
})

// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)
app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!
