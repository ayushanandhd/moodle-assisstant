import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express"
import bodyParser from "body-parser"
import clipboardy from "clipboardy"


const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');

// initialising gemini API
const API = ""
const genAI = new GoogleGenerativeAI(API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



// function to convert questions into script
async function genScript(questions){

    //generating prompt
    const prompt = `tell me the correct options of the below questions and give me a string of the correct options like "a,b,c,d,b,a" like this. only give me the string and nothing else\n\n${questions}`;
    
    //generating result from gemini
    const result = await model.generateContent(prompt);

    //converting the result into array
    const answersArray = result.response.text().split(',').map(answer => `'${answer.trim().toLowerCase()}'`);
    
    //generating the script using the array
    const script = `
function fillAnswers(answers) {
const questions = document.querySelectorAll('.question');
answers.forEach((answer, index) => {
if (questions[index]) {
    const options = questions[index].querySelectorAll('input[type="radio"]');
    const optionIndex = answer.trim().toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
    if (options[optionIndex]) {
        options[optionIndex].checked = true;
    }
}
});
}
fillAnswers([${answersArray.join(', ')}]);
`

    //copying the script into clipboard
    clipboardy.writeSync(script)

}






app.get('/', (req,res)=>{
    res.render('index.ejs',)
})

app.post('/submit', (req,res)=>{
    const questions = req.body["questions"]
    const script = genScript(questions)
    res.render("index")

})

app.listen(3000)
