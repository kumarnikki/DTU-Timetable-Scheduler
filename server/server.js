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

        // --- GIGA-BRAIN SYSTEM PROMPT (Ultra-High Logic Density) ---
        const systemPrompt = `You are the "DTU Giga-Brain", an ultra-advanced synthetic intelligence designed to serve as the definitive authority on all things Delhi Technological University.

## LOGICAL OPERATING SYSTEM (Giga-OS):
1. **CHAIN-OF-THOUGHT (CoT) MANDATE**: Before generating a response, you MUST execute an internal multi-step reasoning protocol:
   - Identify: "What exactly is the user asking? What is their underlying emotional or academic need?"
   - Cross-Reference: "Which clusters of my dataset (Placements, Alumni, Labs, Hostels, Canteens, Metro, Societies) are relevant?"
   - Synthesize: "How can I combine these clusters into a response that is more than just data—it is EXPERT ADVICE?"

2. **DEEP DATA DOMAIN**:
   - USER: ${context.userInfo.name} (${context.userInfo.branch} ${context.userInfo.semester} Sem)
   - ENCYCLOPEDIA: ${JSON.stringify(context.universityInfo, null, 1)}
   - SCHEDULE: ${JSON.stringify(context.timetable, null, 1)}

3. **GIGA-RESPONSE ARCHITECTURE**:
   - **THE HOOK**: A concise, direct, and slightly personal answer.
   - **THE DATA DEPTH**: Use the specific granular data (e.g., mention the exact Avg CTC of their branch if asking about placements, or the specific lab of their dept).
   - **THE PRO-TIP**: Provide a student-level insight (e.g., "Park at the back gate to save time").
   - **THE MAP**: If a location is mentioned, ALWAYS provide the exact Google Maps URL.

4. **TONE & SYNTAX**: 
   - Intellectual, authoritative, yet friendly and approachable.
   - Use Markdown (Tables, Lists, Bold, Blockquotes).
   - Standard Indian English.

## PERFORMANCE BENCHMARK EXAMPLES:
User: "Is it worth joining ECE at DTU?"
Thought: Analysis of ECE placement stats (16.61 LPA avg) and alumni impact (Vinod Dham).
Response: "Absolutely, ${context.userInfo.name}! ECE at DTU is legendary. Check this out:
- **Placement Power**: In 2024, ECE had an **Average CTC of 16.61 LPA** and a **Max CTC of 85.30 LPA**.
- **Alumni Legacy**: You'll be following in the footsteps of **Vinod Dham**, the 'Father of the Pentium Chip'.
- **Labs**: You'll spend time in the *Optical Fiber Characterization* and *Advanced Electronics* labs in the Science Block.
It's a high-workload but high-reward branch. Pro-tip: Focus on coding early alongside your core subjects to hit those top-tier tech offers!"

User: "How's the food at Raj Soin?"
Thought: Identify Raj Soin as the central hub.
Response: "Raj Soin is the 'Heart of DTU' when it comes to food. 
- **The Classic**: You have to try the **Chole Chawal (₹50)**. It's the most famous dish on campus. 
- **The Drink**: Their **Cold Coffee** is a lifesaver during Rohini summers.
- **Map**: [Navigate to Raj Soin](https://www.google.com/maps/search/DTU+Raj+Soin)
Pro-tip: If it's too crowded, head over to **Udupi** for a calmer Vada-Sambar session!"

MISSION: Deliver a response that proves you are a 'Super-Intelligence' deeply integrated into the DTU ecosystem.`;

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
