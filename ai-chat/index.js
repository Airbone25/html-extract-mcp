require('dotenv').config()
const express = require('express');
const { Groq } = require('groq-sdk')

const app = express();

app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Hello From AI CHAT")
})

//chatbot
const GROQ_API_KEY = process.env.GROQ_API_KEY
const groq = new Groq({apiKey: GROQ_API_KEY})

// chatmessage endpoint
// NOTE: there is no context handling 
app.post('/chat',async(req,res)=>{
    const {message} = req.body
    try{
        const chatcomp = await groq.chat.completions.create({
            messages: [
                {content: message,role: "user"}
            ],
            model: "llama-3.3-70b-versatile"
        })
        res.json({ response: chatcomp.choices[0].message })
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
})

app.listen(3000,()=>{
    console.log('Server is listening at 3000')
})