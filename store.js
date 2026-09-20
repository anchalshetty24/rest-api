// A tiny data layer. Notes are kept in memory and saved to data.json,
// so they survive a server restart. In a bigger project this file would
// be replaced by a real database (MongoDB, PostgreSQL, SQLite).
const fs = require('fs');
const path = require('path');

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data.json');

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(data.notes) && Number.isInteger(data.nextId)) return data;
  } catch (error) {
    // No file yet, or it's unreadable: start fresh
  }
  return { nextId: 1, notes: [] };
}

let db = load();

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function getAll() {
  return db.notes;
}

function getById(id) {
  return db.notes.find(note => note.id === id);
}

function create({ title, content }) {
  const now = new Date().toISOString();
  const note = { id: db.nextId++, title, content, createdAt: now, updatedAt: now };
  db.notes.push(note);
  save();
  return note;
}

// Only the fields you pass in are changed
function update(id, changes) {
  const note = getById(id);
  if (!note) return undefined;
  Object.assign(note, changes, { updatedAt: new Date().toISOString() });
  save();
  return note;
}

function remove(id) {
  const index = db.notes.findIndex(note => note.id === id);
  if (index === -1) return false;
  db.notes.splice(index, 1);
  save();
  return true;
}

module.exports = { getAll, getById, create, update, remove };
