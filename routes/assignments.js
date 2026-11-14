const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { unit_id } = req.query;

  if (unit_id) {
    const rows = db
      .prepare('SELECT * FROM assignments WHERE unit_id = ? ORDER BY due_date ASC')
      .all(unit_id);
    return res.json(rows);
  }

  const rows = db
    .prepare('SELECT * FROM assignments ORDER BY due_date ASC')
    .all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { title, due_date, unit_id } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!due_date || !dateRegex.test(due_date)) {
    return res.status(400).json({ error: 'Due date must be in YYYY-MM-DD format' });
  }

  const stmt = db.prepare(
    'INSERT INTO assignments (title, due_date, unit_id) VALUES (?, ?, ?)'
  );
  const info = stmt.run(title.trim(), due_date, unit_id ?? null);

  const created = db
    .prepare('SELECT * FROM assignments WHERE id = ?')
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, due_date, unit_id } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!due_date || !dateRegex.test(due_date)) {
    return res.status(400).json({ error: 'Due date must be in YYYY-MM-DD format' });
  }

  const result = db
    .prepare('UPDATE assignments SET title = ?, due_date = ?, unit_id = ? WHERE id = ?')
    .run(title.trim(), due_date, unit_id ?? null, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM assignments WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  res.json({ deleted: true, id: Number(id) });
});

router.patch('/:id/done', (req, res) => {
  const { id } = req.params;
  const result = db
    .prepare('UPDATE assignments SET done = 1 - done WHERE id = ?')
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  res.json(updated);
});

module.exports = router;