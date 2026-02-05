const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Database Setup
const db = new sqlite3.Database('./registrations.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            squad TEXT,
            reg_number TEXT,
            full_name TEXT,
            class_section TEXT,
            email TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        });
    }
});

// Routes
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle registration submission
app.post('/submit-registration', (req, res) => {
    const { squad, 'reg-number': regNumber, 'full-name': fullName, 'class-section': classSection, email } = req.body;

    const sql = `INSERT INTO registrations (squad, reg_number, full_name, class_section, email) VALUES (?, ?, ?, ?, ?)`;
    const params = [squad, regNumber, fullName, classSection, email];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ success: false, message: 'Transmission Failed: Database Error' });
            return;
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.json({ success: true, message: 'Transmission Successful: You are now registered.' });
    });
});

// View registrations (For debugging/admin)
app.get('/api/registrations', (req, res) => {
    const sql = "SELECT * FROM registrations";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at http://localhost:${PORT}/index.html`);
});
