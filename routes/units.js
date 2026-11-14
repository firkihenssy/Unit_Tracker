const express = require('express');
const router = express.Router();
const unitsStore = require('../store/unitsStore');

// GET /units -> list all units
router.get('/', (req, res) => {
  res.json(unitsStore.getAll());
});

// GET /units/:id -> one unit
router.get('/:id', (req, res) => {
  const unit = unitsStore.getById(req.params.id);
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

  const units = unitsStore.getAll();
  const nextId = units.length ? Math.max(...units.map(u => u.id)) + 1 : 1;

  const unit = { id: nextId, code, name, lecturer, semester };
  units.push(unit);
  unitsStore.saveAll(units);

  res.status(201).json(unit);
});

// PUT /units/:id -> edit a unit
router.put('/:id', (req, res) => {
  const units = unitsStore.getAll();
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
  unitsStore.saveAll(units);

  res.json(unit);
});

// DELETE /units/:id -> remove a unit
router.delete('/:id', (req, res) => {
  const units = unitsStore.getAll();
  const index = units.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  // TODO: once Eliud's store exists, block the delete if this unit has assignments

  units.splice(index, 1);
  unitsStore.saveAll(units);

  res.status(204).send();
});

module.exports = router;