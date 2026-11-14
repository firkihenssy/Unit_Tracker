const Database = require('better-sqlite3');
// This creates a local database file right in your folder
const db = new Database('tracker.db');

// Create the tables your group agreed on
db.exec(`
    CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_code TEXT,
        unit_name TEXT
    );
    
    CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        due_date TEXT,
        done INTEGER DEFAULT 0,
        unit_id INTEGER,
        FOREIGN KEY (unit_id) REFERENCES units(id)
    );
`);

// Check if it's empty, and if so, inject test data so your dashboard works
const count = db.prepare('SELECT COUNT(*) as count FROM assignments').get();
if (count.count === 0) {
    // Add fake units
    db.prepare("INSERT INTO units (id, unit_code) VALUES (1, 'COMP 212'), (2, 'SOEN 102')").run();
    
    // Add fake assignments (Done, Upcoming, and Overdue)
    const insert = db.prepare("INSERT INTO assignments (title, due_date, done, unit_id) VALUES (?, ?, ?, ?)");
    insert.run("Finish Node server", dateModifier(-2), 1, 1); // Done
    insert.run("Read Express docs", dateModifier(3), 0, 2);   // Upcoming
    insert.run("Setup Git branch", dateModifier(-5), 0, 1);   // Overdue
}

// Helper to calculate relative dates for our fake data
function dateModifier(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

module.exports = db;