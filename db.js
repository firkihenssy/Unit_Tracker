const Database = require('better-sqlite3');

const db = new Database('unit_tracker.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    unit_id INTEGER,
    done INTEGER NOT NULL DEFAULT 0
  );
`);

module.exports = db;
