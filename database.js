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
                console.error("Error creating table 'movies':", err.message);
            } else {
                const insert = 'INSERT INTO movies (id, title, director, year) VALUES (?,?,?,?)';
                db.run(insert, [1, "Inception", "Febriyan", 2010]);
                db.run(insert, [2, "Interstellar", "Putra", 2014]);
                console.log("Table 'movies' already exists.");
            }
        }
        )


        // Tabel directors
        db.run(`
            CREATE TABLE directors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                birthYear INTEGER NOT NULL
            )`, (err) => {
            if (!err) {
                const insert = 'INSERT INTO directors (name, birthYear) VALUES (?, ?)';
                db.run(insert, ["Christopher Nolan", 1970]);
                db.run(insert, ["Quentin Tarantino", 1963]);
                db.run(insert, ["Hayao Miyazaki", 1941]);
            }
        });

    }
});
module.exports = db;