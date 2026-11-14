const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'data', 'units.json');

// Load units from the file (or start empty if it doesn't exist yet)
function loadUnits() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Save the current units array to the file
function saveUnits() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(units, null, 2));
}

let units = loadUnits();
let nextId = units.length ? Math.max(...units.map(u => u.id)) + 1 : 1;

// GET /units -> list all units
router.get('/', (req, res) => {
  res.json(units);
});

// GET /units/:id -> one unit
router.get('/:id', (req, res) => {
  const unit = units.find(u => u.id === Number(req.params.id));
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }
  res.json(unit);
});

// POST /units -> add a new unit
router.post('/', (req, res) => {
  const { code, name, lecturer, semester } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Unit code and name are required' });
  }

  const unit = { id: nextId++, code, name, lecturer, semester };
  units.push(unit);
  res.status(201).json(unit);
});

// PUT /units/:id -> edit a unit
router.put('/:id', (req, res) => {
  const unit = units.find(u => u.id === Number(req.params.id));
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  const { code, name, lecturer, semester } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Unit code and name are required' });
  }

  unit.code = code;
  unit.name = name;
  unit.lecturer = lecturer;
  unit.semester = semester;
  res.json(unit);
});

// DELETE /units/:id -> remove a unit
router.delete('/:id', (req, res) => {
  const index = units.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  units.splice(index, 1);
  res.status(204).send();
});

module.exports = router;