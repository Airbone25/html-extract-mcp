require('dotenv').config()
const express = require('express');
const { Groq } = require('groq-sdk')
const path = require('path')

const app = express();

app.use(express.json())
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render('home',{messages: chatHistory})
})

//endpoints to render the chat page and handle chat messages
app.get('/chat-bot',(req,res)=>{
    res.sendFile(path.join(__dirname,'views/index.html'))
})

//chatbot
const GROQ_API_KEY = process.env.GROQ_API_KEY
const groq = new Groq({apiKey: GROQ_API_KEY})

//chathistory
const chatHistory = []

// chatmessage endpoint
app.post('/chat',async(req,res)=>{
    const {message} = req.body
    try{
        const chatcomp = await groq.chat.completions.create({
            messages: [
                ...chatHistory,
                {content: message,role: "user"}
            ],
            model: "llama-3.3-70b-versatile"
        })
        chatHistory.push({content: message, role: "user"})
        chatHistory.push({content: chatcomp.choices[0].message.content, role: "assistant"})
        res.json({ response: chatcomp.choices[0].message.content })
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
})

app.listen(3000,()=>{
    console.log('Server is listening at 3000')
})