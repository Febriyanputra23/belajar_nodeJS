require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const app = express();
const port = process.env.PORT;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const { authenticateToken, authorizeRole } = require('./middleware/auth.js');

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

app.get('/movies', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC;";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);
    });

});

app.get('/movies/:id', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    db.get(sql, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);
    });

});

app.post('/movies', authenticateToken, (req, res) => {
    const { title, director, year } = req.body;
    db.run('INSERT INTO movies (title, director, year) VALUES (?, ?, ?)', [title, director, year], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, director, year });
    });
});

app.put('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const { title, director, year } = req.body;
    const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
    db.run(sql, [title, director, year, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ updatedID: req.params.id, title, director, year });
    });
});

app.delete('/movies/:id', [authenticateToken, authorizeRole('admin')], (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM movies WHERE id=?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deletedID: id });
    });
});

// ================= DIRECTORS =================

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

app.post('/directors', authenticateToken, (req, res) => {
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

app.put('/directors/:id', authenticateToken, (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: "name and birthYear are required" });
    }
    const sql = "UPDATE directors SET name = ?, birthYear = ? WHERE id = ?";
    db.run(sql, [name, birthYear, req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ updatedID: req.params.id, name, birthYear });
    });
});

app.delete('/directors/:id', authenticateToken, (req, res) => {
    const sql = "DELETE FROM directors WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deletedID: req.params.id });
    });
});

// === AUTH ROUTES ===
// profile
app.get('/profile', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM users;";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json(rows);
    });
})

// POST register
app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'username or password (min 6 char) harus diisi' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing:", err);
            return res.status(500).json({ error: "Gagal memproses pendaftaran" });
        }

        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        const params = [username.toLowerCase(), hashedPassword, 'user']; //Tetapkan User
        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint")) {
                    return res.status(400).json({ error: "Username sudah digunakan" });
                }
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "Gagal menyimpan pengguna" });
            }
            res.status(201).json({ message: "Registrasi berhasil", userID: this.lastID });
        });
    });
});

app.post('/auth/register-admin', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username atau password minimal 6 karakter' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing:", err);
            return res.status(500).json({ error: "Gagal memproses pendaftaran" });
        }

        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        const params = [username.toLowerCase(), hashedPassword, 'admin']; //Tetapkan Admin
        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({ error: "Username admin sudah ada" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "Registrasi admin berhasil", userID: this.lastID });
        });
    });
});

// POST login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password harus diisi' });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "Kredensial tidak valid" });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: "Kredensial Tidak Valid" });
            }
            const payload = {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({ error: "Gagal membuat token" });
                }
                res.json({ message: "Login berhasil", token: token });
            });
        });
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