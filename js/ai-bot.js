/**
 * DTU Academic Bot - Frontend Logic
 */

const AIBot = {
    isOpen: false,
    history: [],

    init: () => {
        AIBot.injectUI();
        AIBot.addListeners();
    },

    injectUI: () => {
        const chatHTML = `
            <div class="ai-bot-toggle" id="ai-toggle" title="Ask DTU Bot">
                🤖
            </div>
            <div class="chat-window glass hidden" id="chat-window">
                <div class="chat-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">🤖</span>
                        <div>
                            <div style="font-weight:800; font-size:0.9rem;">DTU Bot</div>
                            <div style="font-size:0.7rem; color:var(--success);">Online</div>
                        </div>
                    </div>
                    <button onclick="AIBot.toggle()" style="background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">×</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">
                        Hello! I'm your DTU Academic Assistant. Ask me anything about your timetable!
                    </div>
                </div>
                <form class="chat-input-area" onsubmit="AIBot.handleSubmit(event)">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Ask about your schedule..." autocomplete="off">
                    <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; width: auto; margin-top:0;">Send</button>
                </form>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    },

    addListeners: () => {
        document.getElementById('ai-toggle').onclick = AIBot.toggle;
    },

    toggle: () => {
        AIBot.isOpen = !AIBot.isOpen;
        const windowEl = document.getElementById('chat-window');
        windowEl.classList.toggle('hidden', !AIBot.isOpen);
        if (AIBot.isOpen) document.getElementById('chat-input').focus();
    },

    addMessage: (text, sender) => {
        const container = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        
        // Save to history for context
        AIBot.history.push({ role: sender === 'bot' ? 'model' : 'user', parts: [{ text }] });
    },

    handleSubmit: async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        AIBot.addMessage(message, 'user');

        try {
            // Show loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot';
            loadingDiv.textContent = 'Thinking...';
            loadingDiv.id = 'bot-loading';
            document.getElementById('chat-messages').appendChild(loadingDiv);

            // 1. Get Timetable Context
            const user = Auth.getCurrentUser();
            const db = DB.get();
            const myClasses = db.classes.filter(c => 
                (user.role === 'student' && c.branch === user.branch && c.section === user.section && c.semester == user.semester) ||
                (user.role === 'professor' && c.professor === user.name)
            );

            // 2. Call Backend Proxy
            const API_BASE = 'https://dtu-timetable-schedular-backend.onrender.com';

            const response = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    context: {
                        userInfo: { name: user.name, role: user.role, branch: user.branch, section: user.section },
                        currentTime: new Date().toLocaleString(),
                        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                        timetable: myClasses,
                        universityInfo: UNIVERSITY_INFO
                    }
                })
            });

            const data = await response.json();
            
            // Remove loading
            document.getElementById('bot-loading').remove();

            if (data.success) {
                AIBot.addMessage(data.response, 'bot');
            } else {
                AIBot.addMessage(data.message || "Sorry, I'm having trouble connecting to my brain. Is the server running?", 'bot');
            }
        } catch (error) {
            console.error("AI Bot Network/Fetch Error:", error);
            if(document.getElementById('bot-loading')) document.getElementById('bot-loading').remove();
            
            // Detailed message for user to report back
            const detailedError = `Network Error: ${error.message}. Is the server URL correct? Check console (F12).`;
            AIBot.addMessage(detailedError, 'bot');
        }
    }
};
