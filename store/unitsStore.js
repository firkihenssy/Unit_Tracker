const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'units.json');

function getAll() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function getById(id) {
  return getAll().find((u) => u.id === Number(id)) || null;
}

function saveAll(units) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(units, null, 2));
}

module.exports = { getAll, getById, saveAll };
