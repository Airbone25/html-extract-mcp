import dotenv from 'dotenv';
import express from 'express';
import { Groq } from 'groq-sdk';
import { join } from 'path';
import { fileURLToPath } from 'url';
import connectClient from './mcp-client.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const app = express();

app.use(express.json())
app.use(express.static('public'))

let mcpClient;
(async() => {
    mcpClient = await connectClient()
    console.log("MCP Client Connected")
})()


app.get('/',(req,res)=>{
    res.redirect('/chat-bot')
})

//endpoints to render the chat page and handle chat messages
app.get('/chat-bot',(req,res)=>{
    res.sendFile(join(__dirname,'views/index.html'))
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

        const {tools} = await mcpClient.listTools()

        const groqTools = tools.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema
            }
        }))

        chatHistory.push({content: message, role: "user"})

        const chatcomp = await groq.chat.completions.create({
            messages: chatHistory,
            model: "llama-3.3-70b-versatile",
            tools: groqTools,
            tool_choice: "auto"
        })

        const responseMessage = chatcomp.choices[0].message
        
        if(responseMessage.tool_calls){
            chatHistory.push(responseMessage)
            for(const toolCall of responseMessage.tool_calls){
                const toolName = toolCall.function.name
                const toolArgs = JSON.parse(toolCall.function.arguments)

                const toolResult = await mcpClient.callTool({
                    name: toolName,
                    arguments: toolArgs
                })

                chatHistory.push({content: JSON.stringify(toolResult.content), role: "tool", tool_call_id: toolCall.id})
            }

            const finalResponse = await groq.chat.completions.create({
                messages: chatHistory,
                model: "llama-3.3-70b-versatile"
            })

            const finalMessage = finalResponse.choices[0].message.content
            chatHistory.push({content: finalMessage, role: "assistant"})
            res.json({ response: finalMessage })
        }else{
            chatHistory.push({content: responseMessage.content, role: "assistant"})
            res.json({ response: responseMessage.content })
        }
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Server Error"})
    }
})

app.listen(3000,()=>{
    console.log('Server is listening at 3000')
})