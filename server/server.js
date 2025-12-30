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
        const { message, context, history } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ success: false, message: 'AI Error: GEMINI_API_KEY is missing from Render environment variables.' });
        }

        // --- GIGA-BRAIN SYSTEM PROMPT (Logic Density: Ultra) ---
        const systemPrompt = `You are the "DTU Giga-Brain", a high-intelligence conversation-first academic advisor. 

## CORE CONVERSATIONAL RULES (CRITICAL):
1. **BREVITY FIRST**: For greetings (Hi, Hello, Hii), just respond warmly and briefly. **DO NOT** provide a summary of the department or timetable unless specifically asked.
2. **RELEVANCE**: Answer the user's specific question directly. If they ask for "directions", give the map. If they ask about "placements", give stats. If they just say "Hi", just say "Hi" back with a warm welcome.
3. **NO UNSOLICITED DATA DUMP**: DO NOT dump the encyclopedia. Only use data points that are 100% relevant to the current user query.
4. **CLEAN MARKDOWN**: Use standard Markdown. Avoid triple asterisks (***). Use simple Bold (**text**) and clean Header tags (###) only for large sections.

## LOGICAL OPERATING SYSTEM:
- Analyze User Intent (Greeting? Technical? Navigational?).
- Context: ${context.userInfo.name} | ${context.userInfo.branch} ${context.userInfo.semester} Sem.
- Encyclopedia: ${JSON.stringify(context.universityInfo, null, 1)}
- Schedule: ${JSON.stringify(context.timetable, null, 1)}

## RESPONSE STYLE:
- **Greeting**: "Hello ${context.userInfo.name}! I am the DTU Giga-Brain. How can I assist you today with your schedule or campus life?"
- **Data Query**: Provide a concise answer + actionable map link if applicable.
- **Tone**: Professional, Indian English, expert-level.

MISSION: Be a smart conversation partner, not a documentation bot. Wait for the user to ask before revealing the depth of your knowledge.`;

        // --- CONSTRUCT FULL CONVERSATION CONTENTS ---
        // We inject the system instructions into a hidden context block at the start
        const contents = [];
        
        // Add Chat History (from frontend)
        if (history && history.length > 0) {
            // Filter to last 10 exchanges for token efficiency if needed, but here we take all
            contents.push(...history.slice(-10)); 
        }

        // Add Current Message with the MASSIVE System Context prepended (to ensure it's always top-of-mind)
        const currentMessageText = `[SYSTEM CONTEXT: ${systemPrompt}]\n\nUSER MESSAGE: ${message}`;
        contents.push({
            role: "user",
            parts: [{ text: currentMessageText }]
        });

        // --- CALL GEMINI ---
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
        
        console.log(`--- [SUPER AI] Request ---`);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                return res.json({ success: true, response: data.candidates[0].content.parts[0].text });
            }
            console.error("Super AI Response Struct Error:", JSON.stringify(data));
            return res.status(500).json({ success: false, message: 'Super AI returned an unreadable response.' });
        } else {
            console.error("Google API Error:", JSON.stringify(data));
            const detail = data.error?.message || 'Unknown API Error';
            let userMessage = `Super AI Error (${response.status}): ${detail}`;
            if (response.status === 429) userMessage += " | TIP: Free Tier quota hit. Wait 60s.";
            return res.status(response.status).json({ success: false, message: userMessage });
        }

    } catch (error) {
        console.error("Super AI Server Error:", error);
        res.status(500).json({ success: false, message: `Super Brain Error: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
