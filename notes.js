const express = require('express');
const store = require('../store');
const { validateNote } = require('../middleware');

const router = express.Router();

// Runs for every route that has :id. Rejects ids that aren't positive whole numbers.
router.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'id must be a positive whole number' });
  }
  req.noteId = id;
  next();
});

// Finds the note or answers 404
function findNote(req, res) {
  const note = store.getById(req.noteId);
  if (!note) {
    res.status(404).json({ error: 'Note ' + req.noteId + ' not found' });
  }
  return note;
}

// GET /api/notes            -> list all notes
// GET /api/notes?search=abc -> only notes whose title or content contains "abc"
router.get('/', (req, res) => {
  let notes = store.getAll();
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  if (search) {
    notes = notes.filter(note =>
      note.title.toLowerCase().includes(search) ||
      note.content.toLowerCase().includes(search)
    );
  }
  res.json({ count: notes.length, notes });
});

// GET /api/notes/:id -> one note
router.get('/:id', (req, res) => {
  const note = findNote(req, res);
  if (note) res.json(note);
});

// POST /api/notes -> create a note
router.post('/', validateNote(true), (req, res) => {
  const note = store.create(req.validated);
  res.status(201).location('/api/notes/' + note.id).json(note);
});

// PUT /api/notes/:id -> replace a note (title required, content resets to "" if left out)
router.put('/:id', validateNote(true), (req, res) => {
  if (!findNote(req, res)) return;
  res.json(store.update(req.noteId, req.validated));
});

// PATCH /api/notes/:id -> change only the fields you send
router.patch('/:id', validateNote(false), (req, res) => {
  if (!findNote(req, res)) return;
  res.json(store.update(req.noteId, req.validated));
});

// DELETE /api/notes/:id -> remove a note (204 = success, nothing to send back)
router.delete('/:id', (req, res) => {
  if (!findNote(req, res)) return;
  store.remove(req.noteId);
  res.status(204).end();
});

module.exports = router;
