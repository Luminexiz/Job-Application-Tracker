const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
// const db = require('./db');
const { connection, pool } = require('./db');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

// ───────────────────────────────────────────────
// 🔹 JOBS API - Fetch from Arbeitnow
// ───────────────────────────────────────────────
// Route to fetch fresh jobs every time from Arbeitnow
app.get('/api/jobs', async (req, res) => {
    try {
        const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');
        const jobs = response.data.data; // actual job listings
        res.json(jobs); // return only the array of jobs
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// ───────────────────────────────────────────────
// 🔹 SIGNUP ROUTE
// ───────────────────────────────────────────────
app.post('/signup', (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
    connection.query(query, [email, username, password], (err, result) => {
        if (err) {
            console.error("MySQL error:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json({ message: "User registered successfully!" });
    });
});

// ───────────────────────────────────────────────
// 🔹 UPDATE PROFILE ROUTE
// ───────────────────────────────────────────────
app.post('/update-profile', (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
    }

    const query = 'UPDATE users SET email = ? WHERE username = ?';
    connection.query(query, [email, username], (err, result) => {
        if (err) {
            console.error("Update profile error:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json({ message: "Profile updated successfully" });
    });
});

// ───────────────────────────────────────────────
// 🔹 UPDATE PASSWORD ROUTE
// ───────────────────────────────────────────────
app.post('/update-password', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const query = 'UPDATE users SET password = ? WHERE username = ?';
    connection.query(query, [password, username], (err, result) => {
        if (err) {
            console.error("Update password error:", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.json({ message: "Password updated successfully" });
    });
});

// ───────────────────────────────────────────────
// 🔹 LOGIN ROUTE
// ───────────────────────────────────────────────
app.post('/login', (req, res) => {
    const { identifier, password } = req.body;

    const query = `SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?`;
    connection.query(query, [identifier, identifier, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful', username: results[0].username });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// ───────────────────────────────────────────────
// 🔹 ADD APPLICATION
// ───────────────────────────────────────────────
app.post('/add-application', (req, res) => {
    const {
        username,
        company,
        position,
        location,
        link,
        resume,
        coverLetter,
        interviewDate,
        followUp,
        referral,
        status,
        date,
        notes
    } = req.body;

    const sql = `
      INSERT INTO applications 
      (username, company_name, position, location, app_link, resume_used, cover_letter_used, interview_date, follow_up_status, referral_name, status, application_date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        username,
        company,
        position,
        location,
        link,
        resume,
        coverLetter,
        interviewDate,
        followUp,
        referral,
        status,
        date,
        notes
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json({ message: "Application added!" });
    });
});

// ───────────────────────────────────────────────
// 🔹 FETCH APPLICATIONS BY USERNAME
// ───────────────────────────────────────────────
app.get('/get-applications/:username', (req, res) => {
    const username = req.params.username;
    connection.query("SELECT * FROM applications WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error("Fetch error:", err);
            return res.status(500).json({ error: "Fetch failed" });
        }
        res.json(results);
    });
});

// ───────────────────────────────────────────────────────────────────
// 🔹 FETCH APPLICATIONS BY USERNAME For summarized stats data
// ───────────────────────────────────────────────────────────────────
app.get('/get-analytics/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const query = `SELECT status FROM applications WHERE username = ?`;
        const [rows] = await pool.execute(query, [username]);

        console.log("Fetched rows:", rows); // 🔍 DEBUG LOG

        const stats = {
            total: rows.length,
            Applied: 0,
            InProgress: 0,
            Interviewed: 0,
            Rejected: 0,
            Offer: 0,
        };

        for (let row of rows) {
            const status = row.status?.trim(); // Safe check & trim whitespace

            console.log("Status:", status); // 🔍 DEBUG LOG

            if (status === "In Progress") {
                stats["InProgress"]++;
            } else if (stats[status] !== undefined) {
                stats[status]++;
            }
        }

        res.json(stats);
    } catch (err) {
        console.error("Analytics fetch error:", err); // 💥 Log actual error
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ───────────────────────────────────────────────────────────────────
// 🔹 FETCH APPLICATIONS BY USERNAME For summarized application_date data
// ───────────────────────────────────────────────────────────────────
app.get('/get-applications-timeline/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const query = `
            SELECT application_date, COUNT(*) as count 
            FROM applications 
            WHERE username = ?
            GROUP BY application_date 
            ORDER BY application_date
        `;

        const [rows] = await pool.execute(query, [username]);
        res.json(rows);
    } catch (err) {
        console.error("Timeline fetch error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ──────────────────────────────────────────────
// 🔹 GET Applications by Company for Charts
// ──────────────────────────────────────────────
app.get('/get-applications-by-company/:username', (req, res) => {
    const { username } = req.params;
    const sql = `
        SELECT company_name, COUNT(*) as count 
        FROM applications 
        WHERE username = ? 
        GROUP BY company_name
    `;
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Company chart error:", err);
            return res.status(500).json({ error: "Failed to fetch company data" });
        }
        res.json(results);
    });
});

// ──────────────────────────
// 🔹 DELETE APPLICATIONS
// ──────────────────────────
app.delete('/delete-application/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM applications WHERE id = ?";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Deletion failed" });
        }
        res.json({ message: "Application deleted successfully" });
    });
});

// ──────────────────────────
// 🔹 EDIT APPLICATIONS
// ──────────────────────────
app.put('/edit-application/:id', (req, res) => {
    const id = req.params.id;
    const {
        company_name, position, location, app_link,
        resume_used, cover_letter_used, interview_date,
        follow_up_status, referral_name, status, application_date, description
    } = req.body;

    const query = `
      UPDATE applications SET
        company_name = ?, position = ?, location = ?, app_link = ?,
        resume_used = ?, cover_letter_used = ?, interview_date = ?,
        follow_up_status = ?, referral_name = ?, status = ?, application_date = ?, description = ?
      WHERE id = ?
    `;

    const values = [
        company_name, position, location, app_link,
        resume_used, cover_letter_used, interview_date,
        follow_up_status, referral_name, status, application_date, description, id
    ];

    connection.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ message: "Application updated successfully" });
    });
});

// ──────────────────────────
// 🔹 ADD DOCUMENTS
// ──────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });


// Serve uploaded files statically
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload document
app.post("/upload-doc", upload.single("document"), (req, res) => {
    const { username } = req.body;
    const filename = req.file.filename;
    const mimetype = req.file.mimetype;

    const sql = "INSERT INTO documents (username, filename, mimetype) VALUES (?, ?, ?)";
    connection.query(sql, [username, filename, mimetype], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Uploaded successfully!" });
    });
});

// Get documents for a user
app.get("/documents/:username", (req, res) => {
    const username = req.params.username;
    const sql = "SELECT * FROM documents WHERE username = ?";
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch documents" });
        }
        res.json(results);
    });
});

// Delete document
app.delete("/documents/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM documents WHERE id = ?";
    connection.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Delete failed" });
        res.json({ message: "Deleted!" });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ───────────────────────────────────────────────
// 🔹 FRONTEND FALLBACK ROUTE
// ───────────────────────────────────────────────
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// ───────────────────────────────────────────────
// 🔹 SERVER STARTUP
// ───────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ───────────────────────────────────────────────
// 🔹 CRASH HANDLING
// ───────────────────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
