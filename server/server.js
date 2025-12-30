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

// Health & Diagnostic Check
app.get('/api/ai/health', async (req, res) => {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return res.json({ success: false, message: 'Missing API Key in Environment' });
        }

        // Fetch list of models from Google to see what's actually available
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(listUrl);
        const data = await response.json();

        res.json({ 
            success: true, 
            message: 'AI Proxy is active.',
            diagnostics: {
                hasKey: true,
                nodeVersion: process.version,
                googleResponse: response.ok ? 'Authorized' : 'Unauthorized',
                availableModels: data.models ? data.models.map(m => m.name.replace('models/', '')) : 'Unable to list models',
                rawError: response.ok ? null : data
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// AI Chat Proxy
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ success: false, message: 'AI Error: GEMINI_API_KEY is missing from Render environment variables.' });
        }

        const prompt = `You are "DTU Academic Bot", a helpful assistant for Delhi Technological University (DTU) students.
You have access to the following data for the user:
- Current Time: ${context.currentTime}
- Current Day: ${context.dayOfWeek}
- Timetable Data: ${JSON.stringify(context.timetable, null, 2)}
- University Info: ${JSON.stringify(context.universityInfo, null, 2)}

Instructions:
1. Answer based on the provided Timetable, University Info, and Today's Date.
2. IMPORTANT: If a student says they are lost or needs directions (e.g., "how to go to main gate"), provide the appropriate Google Maps link from the "navigation" or "landmarks" data.
3. If asked about food/canteens, recommend spots from "student_hotspots" like Raj Soin or Mic Mac.
4. If a new student asks for advice, share the "tips" from the context (e.g., about rickshaws or studies).
5. If asked about the schedule, use the Timetable Data.
6. Use standard Indian English, be concise, and always be helpful. Format links as [Link Text](URL).`;

        // Use gemini-flash-latest (alias for 1.5 Flash) from your available models list
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
        
        console.log(`--- AI Request ---`);
        console.log(`Endpoint: v1beta/gemini-flash-latest`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return res.json({ success: true, response: data.candidates[0].content.parts[0].text });
            }
            console.error("Gemini Response Structure Weird:", JSON.stringify(data));
            return res.status(500).json({ success: false, message: 'AI returned empty or weird response.' });
        } else {
            // Handle specific Google API errors
            console.error("Google API Error:", JSON.stringify(data));
            const detail = data.error?.message || 'Unknown API Error';
            let userMessage = `Google API Error (${response.status}): ${detail}`;
            
            if (response.status === 429) {
                userMessage += " | TIP: You have hit the Free Tier limit or quota for this model. Try again in a minute, or check AI Studio to see if you can enable the Free Tier for this project.";
            }
            
            return res.status(response.status).json({ 
                success: false, 
                message: userMessage 
            });
        }

    } catch (error) {
        console.error("Server AI Error:", error);
        res.status(500).json({ success: false, message: `Internal Server Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
