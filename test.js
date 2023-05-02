import express from 'express'
import bodyParser from 'body-parser'
import redis from 'redis'

const app = express()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const db = redis.createClient({
    url: 'redis://localhost:6379'
})
await db.connect()
const port = 80         // port 80 is used for the http protocal

app.post('/data-entry', urlencodedParser, async (req, res) => {
    res.send(req.body)
})


app.get('/save/:number', async (req, res) => {
    await db.set("thenumber", req.params.number)
    res.send("OK")
})

app.get('/showme', async (req, res) => {
    const number = await db.get("thenumber")
    res.send(`<!DOCTYPE html><html><body>${number}</body></html>`)
})

app.get('/inc', async(req, res) => {
    const count = await db.incrBy("count", req.query.amount || 1)
    res.send(`count: ${count}`)
})
app.get('/dec', async(req, res) => {
    const count = await db.incrBy("count", req.query.amount || -1)
    res.send(`count: ${count}`)
})
app.get(`/echo/:value`, async(req, res) => {
    res.send(req.params)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post('/data-entry', urlencodedParser, async (req, res) => {
    await db.set("form-data", req.body.mytext)
    res.send(`<!DOCTYPE html><html><body>Data saved to Redis key named 'form-data'</body></html>`)
    res.redirect()
})

app.get('/wheres-my-data', async (req, res) => {
    const theData = await db.get("form-data")
    res.send(`<!DOCTYPE html><html><body>Data loaded from Redis is:<P> ${theData}</body></html>`)
})


app.use(express.static('week09/public'))