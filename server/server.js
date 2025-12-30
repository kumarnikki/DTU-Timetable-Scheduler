const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const { GoogleGenerativeAI } = require('@google/generative-ai');

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

        // Initialize Gemini SDK
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are "DTU Academic Bot", a helpful assistant for Delhi Technological University students.
You have access to the following timetable data for the user:
${JSON.stringify(context, null, 2)}

User Question: ${message}

Instructions:
1. Answer based ONLY on the provided JSON data.
2. If the user asks about something not in the data (like other branches or non-academic info), politely say you only have access to their current schedule.
3. Be concise and professional.
4. Use standard Indian English.`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        if (aiResponse) {
            res.json({ success: true, response: aiResponse });
        } else {
            res.status(500).json({ success: false, message: 'AI failed to generate a response.' });
        }
    } catch (error) {
        console.error("AI Proxy Error:", error);
        res.status(500).json({ 
            success: false, 
            message: `Gemini Error: ${error.message || 'Internal Server Error'}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
