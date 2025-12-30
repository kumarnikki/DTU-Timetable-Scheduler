const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load Config
let config = {
    RESEND_API_KEY: process.env.RESEND_API_KEY
};

try {
    const localConfig = require('./config');
    config.RESEND_API_KEY = config.RESEND_API_KEY || localConfig.RESEND_API_KEY;
} catch (e) {
    // config.js not found
}

// DIAGNOSTIC LOG
console.log('--- SYSTEM STATUS ---');
console.log('RESEND_API_KEY:', config.RESEND_API_KEY ? '******* (OK)' : 'MISSING!');
console.log('---------------------');

const resend = new Resend(config.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for OTPs
const otpStore = new Map();

// Diagnostic Endpoint
app.get('/api/test-connection', async (req, res) => {
    try {
        if (!config.RESEND_API_KEY) throw new Error('API Key is missing');
        // Resend doesn't have a simple .verify(), so we'll just check the key presence
        res.json({ success: true, message: 'Resend service is configured!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 1. Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, timestamp: Date.now() });

    const isRegistration = type === 'register';
    const subject = isRegistration ? 'DTU Scheduler - Verify Email' : 'DTU Scheduler - Password Reset';
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Use Resend's default sender for now
            to: email,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6366f1;">${isRegistration ? 'Welcome!' : 'Reset Password'}</h2>
                    <p>Your Verification Code is:</p>
                    <h1 style="letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
                    <p>Valid for 5 minutes.</p>
                </div>
            `
        });

        if (error) throw error;

        console.log(`OTP sent to ${email}`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Resend Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.', error: error.message });
    }
});

// 2. Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const data = otpStore.get(email);

    if (!data) return res.json({ success: false, message: 'No OTP requested' });
    if (Date.now() - data.timestamp > 300000) {
        otpStore.delete(email);
        return res.json({ success: false, message: 'OTP expired' });
    }

    if (data.otp === otp) {
        otpStore.delete(email);
        res.json({ success: true, message: 'OTP verified' });
    } else {
        res.json({ success: false, message: 'Invalid OTP' });
    }
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
