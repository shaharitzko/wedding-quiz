import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

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
        return "Yotam";
    else if (shahar > yotam && shahar > maple)
        return "Shahar";
    return "Maple";
}

const questions = JSON.parse(readQuestionsFile("questions.json"));
let mapleScore = 0;
let shaharScore = 0;
let yotamScore = 0;
let questionNum = 0;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render(__dirname + "/views/index.ejs", {question : questions[questionNum]});
});

app.post("/", (req, res) => {
    if ('vbtn-radio' in req.body) {
        const ans = req.body['vbtn-radio'];
        mapleScore += questions[questionNum].answers[ans].mScore;
        shaharScore += questions[questionNum].answers[ans].sScore;
        yotamScore += questions[questionNum].answers[ans].yScore;
        
        console.log("maple: %d", mapleScore);
        console.log("shahar: %d", shaharScore);
        console.log("yotam: %d", yotamScore);

        questionNum++;
    }
    if (questionNum == questions.length){
        const who = CheckWinner(mapleScore, shaharScore, yotamScore);
        res.render(__dirname + "/views/result.ejs", {result : who});
    } else {   
        res.render(__dirname + "/views/index.ejs", {question : questions[questionNum]});
    }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
