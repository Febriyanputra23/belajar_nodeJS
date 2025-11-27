require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = process.env.DB_SOURCE;
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log(`Connected to the SQLite database.`);

        db.run(`CREATE TABLE IF NOT EXISTS movies (
            id INT PRIMARY KEY,
            title TEXT NOT NULL,
            director TEXT NOT NULL,
            year INT
        );`, (err) => {
            if (err) {
                console.error("Gagal Membuat Tabel 'movies':", err.message);
            } else {
                const insert = 'INSERT or ignore INTO movies (id, title, director, year) VALUES (?,?,?,?)';
                db.run(insert, [1, "Inception", "Febriyan", 2010]);
                db.run(insert, [2, "Interstellar", "Putra", 2014]);
                db.run(insert, [3, "LOTR", "Hariadi", 2012]);
                console.log("Table 'movies' already exists.");
            }
        }
        )


        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
                );`, (err) => {
            if (err) {
                console.error("Gagal Membuat Tabel 'users':", err.message);
            }
        });
        // Tabel directors
        db.run(`CREATE TABLE directors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                birthYear INTEGER NOT NULL
            )`, (err) => {
            if (!err) {
                const insert = 'INSERT or ignore INTO directors (name, birthYear) VALUES (?, ?)';
                db.run(insert, ["Christopher Nolan", 1970]);
                db.run(insert, ["Quentin Tarantino", 1963]);
                db.run(insert, ["Hayao Miyazaki", 1941]);
            }
        });

    }
});
module.exports = db;