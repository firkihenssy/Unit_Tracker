const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'units.json');

// Read all units from the file (empty list if the file doesn't exist yet)
function getAll() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Find one unit by id (works with "1" or 1)
function getById(id) {
  return getAll().find(u => u.id === Number(id));
}

// Save the full list of units to the file
function saveAll(units) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(units, null, 2));
}

module.exports = { getAll, getById, saveAll };