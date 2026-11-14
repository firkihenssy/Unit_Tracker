const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../db');
const unitsStore = require('../store/unitsStore');

const DATA_JSON = path.join(__dirname, '..', 'data.json');

// Keep data.json synced so Erick's /dashboard route reads live SQLite assignments
function syncJsonMirror() {
  const assignments = db.prepare('SELECT * FROM assignments ORDER BY due_date ASC').all();
  fs.writeFileSync(DATA_JSON, JSON.stringify({ assignments }, null, 2));
}
syncJsonMirror();

function validateInput({ title, due_date, unit_id }) {
  if (!title || title.trim() === '') return 'Title is required';
  if (!due_date || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return 'Due date must be in YYYY-MM-DD format';
  }
  if (unit_id !== null && unit_id !== undefined && !unitsStore.getById(unit_id)) {
    return 'That unit does not exist';
  }
  return null;
}

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
  const error = validateInput({ title, due_date, unit_id });
  if (error) return res.status(400).json({ error });

  const stmt = db.prepare(
    'INSERT INTO assignments (title, due_date, unit_id) VALUES (?, ?, ?)'
  );
  const info = stmt.run(title.trim(), due_date, unit_id ?? null);

  const created = db
    .prepare('SELECT * FROM assignments WHERE id = ?')
    .get(info.lastInsertRowid);

  syncJsonMirror();
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, due_date, unit_id } = req.body;
  const error = validateInput({ title, due_date, unit_id });
  if (error) return res.status(400).json({ error });

  const result = db
    .prepare('UPDATE assignments SET title = ?, due_date = ?, unit_id = ? WHERE id = ?')
    .run(title.trim(), due_date, unit_id ?? null, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
  syncJsonMirror();
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM assignments WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  syncJsonMirror();
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
  syncJsonMirror();
  res.json(updated);
});

module.exports = router;