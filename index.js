import express from 'express'
import bodyParser from 'body-parser'
import redis from 'redis'

// make the one and only express object
const app = express()

// make a database connection to redis 
var urlencodedParser = bodyParser.urlencoded({ extended: false})
const db = redis.createClient({
    url: 'redis://localhost:6379'
})
await db.connect()       // if this errors, make sure redis is running

// add routes
// this route serves static files
app.use(express.static('public'))

// this route serves the home page, using code
app.get('/', async(req, res) => {
    res.redirect(`home.html`)
})

app.post('/add', urlencodedParser, async(req, res) => {
    var quizName = req.body.quizName
    console.log(quizName) // TEMP
    await db.hSet('questionCount', quizName, '0')
    
    res.send(`<!DOCTYPE html>
    <html>
    <head>
        <title>Add a Question</title>
    </head>
    <body>
        <h1>Add Your First Question</h1>
            <h2>Here is Your Quiz's Name:</h2>
                ${quizName}
            <form action="/add/${quizName}/1" method="post">
                <h2>Type Your Question Below:</h2>
                <textarea id="questionText" name="questionText" rows="5" cols="40"></textarea>
                <h2>Type the Answer Below:</h2>
                <input type="text" id="answerText" name="answerText"><br />
                <br />
                <button type="submit">Submit This Question</button>
            </form>
    </body>
    </html>`)
})

app.post('/add/:quizName/:count', urlencodedParser, async (req, res) => {
    var quizName = req.params.quizName
    var count = Number(req.params.count)
    
    console.log(`The name of this quiz is: ${quizName}`) //TEMP
    console.log(`This is question ${count}`) //TEMP
    
    const questionText = req.body.questionText
    const answerText = req.body.answerText


    await db.set(`${quizName}-question-${count}`, questionText)
    await db.set(`${quizName}-answer-${count}`, answerText)
    await db.hSet("questionCount", quizName, count) 
    var nextCount = count + 1  //Why does this just put a "1" next to count instead of mathimatically adding them?

    res.send(`<!DOCTYPE html>
    <html>
    <head>
        <title>Question ${nextCount}</title>
    </head>
    <body>
        <h1>Question ${nextCount}:</h1>
            <h2>Add Your Question Below:</h2>
                <form action="/add/${quizName}/${nextCount}" method="post">
                    <textarea id="questionText" name="questionText" rows="5" cols="40"></textarea>
                    <h2>Add Its Answer Below:</h2>
                    <input type="text" id="answerText" name="answerText">
                    <button type="submit">Click Here to Submit This Question</button>
                </form>
                <br />
                Simply click <a href="http://localhost/home.html">done</a> when you're finished adding questions!
    </body>
    </html>`)    
})

// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)
app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!