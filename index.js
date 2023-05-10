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

////
////
////These are the /take routes

app.post('/take', urlencodedParser, async(req, res) => {
    console.log("This makes sure that this is running properly")  // TEMP
    
    var quizName = req.body.userName
    const inCase = 'Sorry, this quiz does not exist.'
    if (quizName == '') {
        quizName = inCase
    }

    var userName = req.body.quizName
    if (userName == '') {
        userName = 'unknown user'
    }

    console.log(quizName) // TEMP
    
    var firstQuestion = await db.get(`${quizName}-question-1`)
    if (firstQuestion == null) {
        firstQuestion = "Sorry, this thing your on doesn't exist :("
    }
    await db.hGet('questionCount', quizName, '0') 
    
    if (quizName == inCase) {
        res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>Error</title>
        </head>
        <body>
            <h1>${inCase}</h1>
                <strong>Don't worry; click <em><a href="http://localhost">here</a></em> to return to the homepage.</strong>
        </body>
       </html>`)
    } else {

        res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>Question 1 in ${quizName}</title>
        </head>
        <body>
            <h1>Question 1 in ${quizName}</h1>
                <strong>${firstQuestion}</strong>
                
                <form action="/take/${quizName}/${userName}/2" method="post">
                    <h2>Type the Answer Below:</h2>
                    <input type="text" id="userInput" name="userInput"><br />
                    <br />
                    <button type="submit">Click Here to Submit Your Answer</button>
                </form>
        </body>
        </html>`)

    }
})

app.post('/take/:quizName/:userName/:questionNum', urlencodedParser, async(req, res) => {
    var userName = req.params.userName
    var quizName = req.params.quizName
    var questionNum = Number(req.params.questionNum)
    var previousQuestionNum = questionNum - 1

    //These two lines save the user's input from the previous question
    var userInput = req.body.userInput
    await db.set(`${quizName}-${userName}-${previousQuestionNum}`, `${userInput}`)
    
    console.log(`The name of this quiz is: ${quizName}`) //TEMP
    console.log(`This is question ${questionNum}`) //TEMP
    
    const questionText = req.body.questionText
    const answerText = req.body.answerText

    const suspicious = await db.get(`${quizName}-question-${questionNum}`, questionText)

    if (suspicious == null) {
        console.log("suspicious stuff is happening")  //TEMP
        res.redirect(`/take/${quizName}/${userName}/score`)
    } else {

        await db.get(`${quizName}-answer-${questionNum}`, answerText)
        await db.hSet("questionCount", quizName, questionNum) 

        res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>Question ${questionNum} in ${quizName}</title>
        </head>
        <body>
            <h1>Question ${questionNum}:</h1>
                <strong>${suspicious}</strong>
                <form action="/take/${quizName}/${userName}/${questionNum + 1}" method="post">
                    <h2>Type the Answer Below:</h2>
                        <input type="text" id="userInput" name="userInput"><br />
                        <br />
                        <button type="submit">Click Here to Submit Your Answer</button>
                </form>
                <br />
                Simply click <a href="http://localhost/home.html">done</a> if you get bored!
        </body>
        </html>`)
    }
})

app.get('/take/:quizName/:userName/score', urlencodedParser, async(req, res) => {
    const quizName = req.params.quizName
    const userName = req.params.userName
    
    ///var questionQuantity = 0

    ///for (var loopVar = 0; loopVar < 999999999999999; loopVar++) {
    ///    var g = await db.get(`${quizName}-question-${loopVar}`)
    ///    if (g == null) {
    ///        break
    ///    }
    ///    questionQuantity++
    ///}

    var correctAnswerKeys = await db.keys(`${quizName}-answer-*`)
    correctAnswerKeys.sort()  //Even if these don't get sorted in the order they were answered, this should work
    var takerAnswerKeys = await db.keys(`${quizName}-${userName}-*`)
    takerAnswerKeys.sort()

    var score = 0
    var total = 0
    var incorrect = 0

    for(var i = 0; i < correctAnswerKeys.length; i++) {
        var correctAnswer = await db.get(correctAnswerKeys[i])
        var takerAnswer = await db.get(takerAnswerKeys[i])
        if (takerAnswer == correctAnswer) {
            score++
        } else {
            incorrect++
        }
        total++
    }

    const quotient = Math.floor(100 / total)
    const percent = Math.round(quotient * score)

    
    res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>${userName}'s Score on "${quizName}"</title>
        </head>
        <body>
            <h1>${userName}'s Score on "${quizName}"</h1>
                <h2>Number Correct:</h2>
                    <strong>${score} out of ${total}</strong>
                <h2>Number Incorrect:</h2>
                    <strong>${incorrect} out of ${total}</strong>
                <h2>Percentage Score:</h2>
                    <strong>${percent}%</strong>
                <br />
                <br />
                <strong>Just click <em><a href="http://localhost/home.html">here</a></em> to return to the homepage.</strong>
        </body>
        </html>`)
})

app.post('/delete', urlencodedParser, async(req, res) => {
    const quizName = req.body.quizName

    const keys = await db.keys(`${quizName}-*`)
    await db.del(keys)
    
    const checkForKeys = await db.keys(`${quizName}-`)  //TEMP
    console.log(checkForKeys)  //TEMP

    res.send(`<!DOCTYPE html>
        <html>
        <head>
            <title>Quiz Deleted successfully</title>
        </head>    
        <body>
            <h3> Quiz Deleted successfully <h3>
            <h4><a href="http://localhost/home.html">Homepage</a></h4>
        </body>
        </html>`)
})

// all configuration is done, now let's have express listen for Browser connections
// on port 80 (the standard port for HTTP)

app.listen(80, () => {
    console.log(`The quiz server is listening on port 80`)
  })

// now express takes over until the program is stopped!