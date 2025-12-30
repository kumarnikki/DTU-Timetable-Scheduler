const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Minimal Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running - Auth is now handled via Google on the frontend.' });
});

// AI Chat Proxy
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ success: false, message: 'AI Service Not Configured. Please add GEMINI_API_KEY to Render environment variables.' });
        }

        const prompt = `You are "DTU Academic Bot", a helpful assistant for Delhi Technological University students.
You have access to the following timetable data for the user:
${JSON.stringify(context, null, 2)}

User Question: ${message}

Instructions:
1. Answer based ONLY on the provided JSON data.
2. If the user asks about something not in the data (like other branches or non-academic info), politely say you only have access to their current schedule.
3. Be concise and professional.
4. Use standard Indian English.`;

        // Direct REST API call to stable v1 endpoint
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API HTTP Error:", response.status, errorText);
            return res.status(500).json({ 
                success: false, 
                message: `Gemini API Error (${response.status}): ${errorText}` 
            });
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            res.json({ success: true, response: aiResponse });
        } else {
            console.error("Unexpected Gemini Response:", JSON.stringify(data, null, 2));
            res.status(500).json({ 
                success: false, 
                message: 'AI returned unexpected response format.' 
            });
        }
    } catch (error) {
        console.error("AI Proxy Error:", error);
        res.status(500).json({ 
            success: false, 
            message: `Server Error: ${error.message}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
