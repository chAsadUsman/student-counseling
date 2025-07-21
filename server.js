const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',  // 🔐 change this
  database: 'student_counseling'
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});

// Register route
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed' });
    }
    res.status(200).json({ message: 'Registration successful' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// 🧑 Register
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      return res.status(500).json({ message: 'Error registering user.' });
    }
    res.status(201).json({ message: 'User registered successfully.' });
  });
});

// 🔐 Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login failed.' });
    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  });
});

// 📆 Book Counseling
app.post('/book-counseling', (req, res) => {
  const { name, email, date, message } = req.body;
  const sql = 'INSERT INTO counseling_appointments (name, email, date, message) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, date, message], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to book counseling.' });
    res.status(200).json({ message: 'Counseling appointment booked.' });
  });
});

// 📝 Career Assessment Submission
app.post('/submit-assessment', (req, res) => {
  const { userId, answers } = req.body;
  const sql = 'INSERT INTO career_assessments (user_id, answers) VALUES (?, ?)';
  db.query(sql, [userId, JSON.stringify(answers)], (err) => {
    if (err) return res.status(500).json({ message: 'Submission failed.' });
    res.status(200).json({ message: 'Assessment submitted.' });
  });
});

// 📊 Dashboard Data
app.get('/dashboard-data', (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS userCount,
      (SELECT COUNT(*) FROM counseling_appointments) AS appointmentCount,
      (SELECT COUNT(*) FROM career_assessments) AS assessmentCount
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to load dashboard data.' });
    res.status(200).json(results[0]);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
