const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load Config (Support both Local config.js and Production Env Vars)
let config = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
};

try {
    const localConfig = require('./config');
    // If local config exists, use it as fallback or override
    config.EMAIL_USER = config.EMAIL_USER || localConfig.EMAIL_USER;
    config.EMAIL_PASS = config.EMAIL_PASS || localConfig.EMAIL_PASS;
} catch (e) {
    // config.js not found (Expected in Production/Render)
    console.log('Using Environment Variables for Configuration');
}

const app = express();
// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for OTPs (For production, use Redis or Database)
// Map: email -> { otp, timestamp }
const otpStore = new Map();

// Email Transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

// 1. Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (valid for 5 minutes)
    otpStore.set(email, {
        otp: otp,
        timestamp: Date.now()
    });

    const isRegistration = type === 'register';
    const subject = isRegistration ? 'DTU Scheduler - Verify Your Email' : 'DTU Scheduler - Password Reset OTP';
    const title = isRegistration ? 'Welcome to DTU Scheduler!' : 'Password Reset Request';
    const messageBody = isRegistration 
        ? 'Please accept this verification code to complete your registration.' 
        : 'You requested to reset your password for the DTU Timetable Scheduler.';

    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">${title}</h2>
                <p>${messageBody}</p>
                <p>Your Verification Code is:</p>
                <h1 style="letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
                <p>This code is valid for 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${otp}`); // Log for debugging (remove in prod)
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Check server logs.' });
    }
});

// 2. Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const data = otpStore.get(email);

    if (!data) {
        return res.json({ success: false, message: 'No OTP requested for this email' });
    }

    // Check expiration (5 minutes = 300000 ms)
    if (Date.now() - data.timestamp > 300000) {
        otpStore.delete(email);
        return res.json({ success: false, message: 'OTP has expired' });
    }

    if (data.otp === otp) {
        otpStore.delete(email); // Invalidate OTP after use
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.json({ success: false, message: 'Invalid OTP' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Email Service Configured with User: ${config.EMAIL_USER}`);
});
