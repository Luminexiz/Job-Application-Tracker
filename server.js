const express = require('express');
const path = require('path');
const app = express();

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// API route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello World' });
});

// Fallback to frontend for unknown routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
