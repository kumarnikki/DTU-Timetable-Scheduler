const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Minimal Health Check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running - Auth is now handled via Google on the frontend.' });
});

app.listen(PORT, () => {
    console.log(`--- Server Started ---`);
    console.log(`Port: ${PORT}`);
});
