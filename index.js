import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

function readQuestionsFile(questionsFilePath) {
    try {
        // Read the contents of the JSON file synchronously
        const data = fs.readFileSync(questionsFilePath, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        return null;
    }
}

function CheckWinner(maple, shahar, yotam) {
    if (yotam > shahar && yotam > maple)
        return "יותם";
    else if (shahar > yotam && shahar > maple)
        return "שחר";
    return "מייפל";
}

const questions = JSON.parse(readQuestionsFile("questions.json"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up express-session
app.use(session({
    secret: 'mySecret', // replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: null, secure: false } // Session cookie expires when the browser is closed
}));

app.get("/", (req, res) => {
    // Initialize session variables if not already set
    if (!req.session.mapleScore && !req.session.shaharScore && !req.session.yotamScore) {
        req.session.mapleScore = 0;
        req.session.shaharScore = 0;
        req.session.yotamScore = 0;
        req.session.questionNum = 0;
    } else if (req.session.questionNum == questions.length){
        const who = CheckWinner(req.session.mapleScore, req.session.shaharScore, req.session.yotamScore);
        res.render(__dirname + "/views/result.ejs", {result : who});
    }
    res.render(__dirname + "/views/index.ejs", {question : questions[req.session.questionNum]});
});

app.post("/", (req, res) => {
    if ('vbtn-radio' in req.body) {
        const ans = req.body['vbtn-radio'];

        req.session.mapleScore += questions[req.session.questionNum].answers[ans].mScore;
        req.session.shaharScore += questions[req.session.questionNum].answers[ans].sScore;
        req.session.yotamScore += questions[req.session.questionNum].answers[ans].yScore;

        req.session.questionNum++;
    }
    if (req.session.questionNum == questions.length){
        const who = CheckWinner(req.session.mapleScore, req.session.shaharScore, req.session.yotamScore);
        res.render(__dirname + "/views/result.ejs", {result : who});
    } else {   
        res.render(__dirname + "/views/index.ejs", {question : questions[req.session.questionNum]});
    }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
