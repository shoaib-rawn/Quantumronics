import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

const VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];
const COLUMNS = `id, company, role, status, applied_date::text AS "appliedDate"`;

function validate(data, partial = false) {
  const errors = [];
  const { company, role, status } = data;

  if (!partial || company !== undefined) {
    if (typeof company !== 'string' || company.trim() === '') {
      errors.push('company must be a non-empty string');
    }
  }
  if (!partial || role !== undefined) {
    if (typeof role !== 'string' || role.trim() === '') {
      errors.push('role must be a non-empty string');
    }
  }
  if (!partial || status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }
  return errors;
}

const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  req.id = id;
  next();
};

// GET /api/applications/stats   (/:id se PEHLE)
router.get('/stats', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM applications
     GROUP BY status
     ORDER BY count DESC`
  );
  res.json(rows);
});

// GET /api/applications   (optional: ?status=Interview)
router.get('/', async (req, res) => {
  const { status } = req.query;
  let sql = `SELECT ${COLUMNS} FROM applications`;
  const params = [];

  if (status) {
    params.push(status);
    sql += ` WHERE status = $1`;
  }
  sql += ' ORDER BY id';

  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

// GET /api/applications/:id
router.get('/:id', validateId, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM applications WHERE id = $1`,
    [req.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(rows[0]);
});

// POST /api/applications
router.post('/', async (req, res) => {
  const { company, role, status = 'Applied', appliedDate } = req.body || {};

  const errors = validate({ company, role, status });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const userId = 1; // login abhi nahi, is liye fixed user

  const { rows } = await pool.query(
    `INSERT INTO applications (user_id, company, role, status, applied_date)
     VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
     RETURNING ${COLUMNS}`,
    [userId, company.trim(), role.trim(), status, appliedDate || null]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/applications/:id   (poora replace)
router.put('/:id', validateId, async (req, res) => {
  const { company, role, status, appliedDate } = req.body || {};

  const errors = validate({ company, role, status });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { rows } = await pool.query(
    `UPDATE applications
     SET company = $1, role = $2, status = $3, applied_date = $4
     WHERE id = $5
     RETURNING ${COLUMNS}`,
    [company.trim(), role.trim(), status, appliedDate || null, req.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(rows[0]);
});

// PATCH /api/applications/:id   (sirf bheji hui fields)
router.patch('/:id', validateId, async (req, res) => {
  const body = req.body || {};

  const errors = validate(body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const fieldToColumn = {
    company: 'company',
    role: 'role',
    status: 'status',
    appliedDate: 'applied_date',
  };

  const setClauses = [];
  const values = [];

  for (const [field, column] of Object.entries(fieldToColumn)) {
    if (body[field] !== undefined) {
      const value = typeof body[field] === 'string' ? body[field].trim() : body[field];
      values.push(value);
      setClauses.push(`${column} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  values.push(req.id);
  const { rows } = await pool.query(
    `UPDATE applications
     SET ${setClauses.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${COLUMNS}`,
    values
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(rows[0]);
});

// DELETE /api/applications/:id
router.delete('/:id', validateId, async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM applications WHERE id = $1',
    [req.id]
  );
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.status(204).send();
});

export default router;
