//final week 10
import express from 'express'
import bodyParser from 'body-parser'
import redis from 'redis'

const app = express()

var urlencodedParser = bodyParser.urlencoded({ extended: false})
const db = redis.createClient({
    url: 'redis://localhost:6379'
})
await db.connect()    

app.use(express.static('public'))



app.get('/', async(req, res) => {
    res.send(`<!DOCTYPE html><html><body><A href="/home.html">Say Hello</A></body></html>`)
})

app.post('/add', urlencodedParser, async(req, res) => {
    var quizName = req.body.quizName
    await db.set('quizName', quizName)
    console.log(quizName)
    await db.hSet('questionCount', quizName, '0')
    const g = await db.get('quizName')
    console.log(`g is ${g}`)
    await db.set('ttttt', 1)
    
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
    const quizName = await db.get('quizName')
    console.log(`The name of this quiz is: ${quizName}`)
    await db.incr('ttttt')
    const count = await db.get('ttttt')
    console.log(`This is question ${count}`)
    
    const questionText = req.body.questionText
    const answerText = req.body.answerText


    await db.set(`${quizName}-question-${count}`, questionText)
    await db.set(`${quizName}-answer-${count}`, answerText)
    //await db.hIncr("questionCount", quizName)  It says that hIncr() isn't a function

    res.send(`<!DOCTYPE html>
    <html>
    <head>
        <title>Question ${count}</title>
    </head>
    <body>
        <h1>Question ${count}:</h1>
            <h2>Add Your Question Below:</h2>
                <form action="/add/${quizName}/${count + 1}" method="post">
                    <textarea id="questionText" name="questionText"></textarea>
                    <h2>Add Its Answer Below:</h2>
                    <input type="text" id="answerText" name="answerText">
                    <button type="submit">Click Here to Submit This Question</button>
                </form>
                <br />
                <a href="http://localhost/home.html">Done</a>
    </body>
    </html>`)    
})

app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })