const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    try {
        // Change 'data.json' if your team named the file something else!
        const dataPath = path.join(__dirname, '../data.json');
        
        // If they haven't created the JSON file yet, show the waiting message safely
        if (!fs.existsSync(dataPath)) {
            return res.status(500).json({ error: "Waiting for team to create the JSON file" });
        }

        // Read and parse the JSON file
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);
        
        // Assuming they store assignments in an array called "assignments"
        const assignments = data.assignments || [];

        // Helper dates for comparison
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        // 1. Calculate Progress (using standard JS instead of SQL)
        const total = assignments.length;
        const doneCount = assignments.filter(a => a.done === 1 || a.done === true).length;

        // 2. Find Upcoming
        const upcomingQuery = assignments.filter(a => 
            (a.done === 0 || a.done === false) && 
            a.due_date >= today && 
            a.due_date <= nextWeekStr
        );

        // 3. Find Overdue
        const overdueQuery = assignments.filter(a => 
            (a.done === 0 || a.done === false) && 
            a.due_date < today
        );

        // Send the exact shape your frontend expects
        res.json({
            upcoming: upcomingQuery,
            overdue: overdueQuery,
            progress: {
                done: doneCount,
                total: total
            }
        });
        
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Failed to read JSON data" });
    }
});

module.exports = router;