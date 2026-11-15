import { Router } from 'express';
import pool from '../db/index.js';
import Note from '../models/Note.js';
import { validateId } from '../middleware/validateId.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

const router = Router();

const OBJECT_ID = /^[a-f\d]{24}$/i;

const validateNoteId = (req, res, next) => {
  if (!OBJECT_ID.test(req.params.noteId)) {
    return res.status(400).json({ error: 'noteId must be a 24-character hex string' });
  }
  next();
};

const applicationExists = async (req, res, next) => {
  const { rowCount } = await pool.query(
    'SELECT 1 FROM applications WHERE id = $1',
    [req.id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }
  next();
};

// GET /api/applications/:id/notes?page=1&limit=10
router.get('/applications/:id/notes', validateId, applicationExists, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const filter = { applicationId: req.id };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Note.countDocuments(filter),
  ]);

  res.json({ data: notes, pagination: buildMeta(page, limit, total) });
});

// POST /api/applications/:id/notes
router.post('/applications/:id/notes', validateId, applicationExists, async (req, res) => {
  const { text, category } = req.body || {};
  const note = await Note.create({ applicationId: req.id, text, category });
  res.status(201).json(note);
});

// PATCH /api/notes/:noteId
router.patch('/notes/:noteId', validateNoteId, async (req, res) => {
  const { text, category } = req.body || {};

  const updates = {};
  if (text !== undefined) updates.text = text;
  if (category !== undefined) updates.category = category;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const note = await Note.findByIdAndUpdate(req.params.noteId, updates, {
    new: true,
    runValidators: true,
  });
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

// DELETE /api/notes/:noteId
router.delete('/notes/:noteId', validateNoteId, async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.status(204).send();
});

export default router;
