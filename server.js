const express = require('express');
const path = require('path');
const app = express();

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback to index.html for unknown routes (must come after static middleware)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
