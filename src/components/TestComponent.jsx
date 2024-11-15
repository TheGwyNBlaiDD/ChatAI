import React, { useState, useEffect, useRef } from 'react';

export default function TestComponent() {
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8080`);
        ws.current.onopen = () => console.log('WebSocket connected');
        ws.current.onclose = () => console.log('WebSocket disconnected');

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, { role: message.role , content: message.content }]);
        };

        return () => ws.current.close();
    }, []);

    const handleSend = () => {
        if (prompt.trim()) {
            const userMessage = { role: 'user', content: prompt };
            setMessages([...messages, userMessage]);

            ws.current.send(JSON.stringify({
                message: userMessage.content,
            }));

            setPrompt('');
        }
    };

    const handleKeyDown = (enter) => {
        if (enter.key === 'Enter') {
            handleSend();
        }
    };

    const printText = (elem) => {
        const text = elem.textContent.replace(/\s+/g, ' ').trim();
        let count = 0;
        let newText = '';

        elem.textContent = '';

        const interval = setInterval(() => {
            newText += text[count]
            elem.textContent = newText
            count++

            if(count === text.length) {
                clearInterval(interval)
            }
        }, 50);
    }      
    
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant') {
            const chatMessage = [...document.querySelectorAll('.chat-message.assistant p.content')].pop();
            if (chatMessage) {
                printText(chatMessage);
            }
        }
    }, [messages])

    

    return (
        <div className="chat-box">
            <h2>Chat AI</h2>
            <div className="chat-container">
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.role}`}>
                        <p>{message.role === 'assistant' ? 'Bot:' : 'User:'}</p>
                        <p className='content'>{message.content}</p>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your prompt here..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}

