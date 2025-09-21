require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const port = process.env.PORT;
app.use(cors());

// const port = 3100;

//middleware data
app.use(express.json());

//dummy data (id,title,director,year)
// let movies = [
//     { id: 1, title: 'LOTR', director: 'Peter Jackson', year: 1999 },
//     { id: 2, title: 'avenger', director: 'Peter Jackson', year: 2010 },
//     { id: 3, title: 'spiderman-', director: 'Peter Jackson', year: 2004 },
// ];

let director = [
    { id: 1, name: 'Peter Jackson' },
    { id: 2, name: 'Peter Jackson' },
    { id: 3, name: 'Peter Jackson' },
];

// console.log(movies);



// app.get('/', (req, res) => {
//     res.send('Selamat Datang diserver Node.js Tahap awal, terimakasih');
// });


app.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date()
    });
}


);

app.get('/movies', (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC;";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);
    });

});

// ================= DIRECTORS =================
// Ini adalah bagian kode yang sesuai dengan tugas praktikum[cite: 3].
app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/directors/:id', (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(row || { message: "Director not found" });
    });
});

app.post('/directors', (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    const sql = "INSERT INTO directors (name, birthYear) VALUES (?, ?)";
    db.run(sql, [name, birthYear], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, birthYear });
    });
});

app.put('/directors/:id', (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    const sql = "UPDATE directors SET name = ?, birthYear = ? WHERE id = ?";
    db.run(sql, [name, birthYear, req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updatedID: req.params.id, name, birthYear });
    });
});

app.delete('/directors/:id', (req, res) => {
    const sql = "DELETE FROM directors WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deletedID: req.params.id });
    });
});

//handle 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

//information server listening
app.listen(port, () => {
    console.log(`Server Running on localhost:  ${port}`);
});