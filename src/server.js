require('dotenv').config();
const WebSocket = require('ws');
const { Groq } = require('groq-sdk');

const wss = new WebSocket.Server({ port: 8080 });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

wss.on('connection', (ws) => {
    ws.on('message', async (msg) => {
        const {message} = JSON.parse(msg);
        const response = await groq.chat.completions.create({
            messages: [
              {
                role: "user",
                content: message,
              },
            ],
            model: "llama3-8b-8192",
        });
        ws.send(JSON.stringify(response.choices[0].message));
    });
    ws.on('error', (error) => {
        console.log('error', error);
    });
});
