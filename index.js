import express from 'express'
import bodyParser from 'body-parser'
import redis from 'redis'

// make the one and only express object
const app = express()

var urlencodedParser = bodyParser.urlencoded({ extended: false})

// make a database connection to redis
const db = redis.createClient({
    url: 'redis://localhost:6379'
})

await db.connect()  // if this errors, make sure redis is running

// add routes
// this route serves static files
app.use(express.static('public'))

// this route serves the home page, using code
app.get('/', async(req, res) => {
    res.send(`<!DOCTYPE html><html><body><A href="/text.html">Say Hello</A></body></html>`)
})



//This is the add a question page
app.post('/add', urlencodedParser, async(req, res) => {
    var quizName = req.body.quizThing
    console.log(quizName)
    await db.hSet('questionCount', quizName, '0')
    res.send(`<!DOCTYPE html>
    <html>
    <head>
        <title>Add a Question</title>
    </head>
    <body>
        <h1>Add a Question</h1>
            <form action="/add/:quizName/1" method="post">
                <h2>Type Your Question Below:</h2>
                <textarea id="questionText" rows="5" cols="40"></textarea>
                <h2>Type the Answer Below:</h2>
                <input type="text" id="answerText">
                <button type="submit"
            </form>
    </body>
    </html>`)
})

app.post('/add/:quizName/1', urlencodedParser, async(req, res) => {

})

app.post('/add/:quizName/:count', urlencodedParser, async(req, res) => {
    
})

// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)
app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!
