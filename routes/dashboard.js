const express = require('express');
const router = express.Router();
// We use ../ to go up one folder to find the team's database file
const db = require('../db.js'); 

// This replaces the old placeholder!
router.get('/', (req, res) => {
    try {
        const progressQuery = db.prepare(`
            SELECT 
                COUNT(*) as total, 
                COALESCE(SUM(done), 0) as done 
            FROM assignments
        `).get();

        const upcomingQuery = db.prepare(`
            SELECT id, title, due_date, unit_id 
            FROM assignments 
            WHERE done = 0 
            AND due_date >= date('now') 
            AND due_date <= date('now', '+7 days')
        `).all();

        const overdueQuery = db.prepare(`
            SELECT id, title, due_date, unit_id 
            FROM assignments 
            WHERE done = 0 
            AND due_date < date('now')
        `).all();

        res.json({
            upcoming: upcomingQuery,
            overdue: overdueQuery,
            progress: {
                done: progressQuery.done || 0,
                total: progressQuery.total || 0
            }
        });
        
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Failed to load dashboard data" });
    }
});

module.exports = router;