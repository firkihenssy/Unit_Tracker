const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  try {
    const assignments = db
      .prepare('SELECT * FROM assignments ORDER BY due_date ASC')
      .all();

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const total = assignments.length;
    const doneCount = assignments.filter((a) => a.done === 1 || a.done === true).length;

    const upcoming = assignments.filter(
      (a) => !a.done && a.due_date >= today && a.due_date <= nextWeekStr
    );
    const overdue = assignments.filter((a) => !a.done && a.due_date < today);

    res.json({
      upcoming,
      overdue,
      progress: { done: doneCount, total }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;
