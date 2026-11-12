import { Router } from 'express';

const router = Router();

const VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

let applications = [
  { id: 1, company: 'Google', role: 'Frontend Developer', status: 'Applied', appliedDate: '2026-11-01' },
  { id: 2, company: 'Systems Ltd', role: 'Full Stack Developer', status: 'Interview', appliedDate: '2026-11-05' },
];
let nextId = 3;

const findIndexById = (id) => applications.findIndex((item) => item.id === Number(id));

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

// GET /api/applications  (optional filter: ?status=Interview)
router.get('/', (req, res) => {
  const { status } = req.query;

  if (status) {
    const filtered = applications.filter((item) => item.status === status);
    return res.json(filtered);
  }
  res.json(applications);
});

// GET /api/applications/:id
router.get('/:id', (req, res) => {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(applications[index]);
});

// POST /api/applications
router.post('/', (req, res) => {
  const { company, role, status = 'Applied', appliedDate } = req.body || {};

  const errors = validate({ company, role, status });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newApplication = {
    id: nextId++,
    company: company.trim(),
    role: role.trim(),
    status,
    appliedDate: appliedDate || new Date().toISOString().slice(0, 10),
  };

  applications.push(newApplication);
  res.status(201).json(newApplication);
});

// PUT /api/applications/:id  (poora replace)
router.put('/:id', (req, res) => {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const { company, role, status, appliedDate } = req.body || {};
  const errors = validate({ company, role, status });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  applications[index] = {
    id: applications[index].id,
    company: company.trim(),
    role: role.trim(),
    status,
    appliedDate: appliedDate || null,
  };
  res.json(applications[index]);
});

// PATCH /api/applications/:id  (sirf bheji hui fields update)
router.patch('/:id', (req, res) => {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const body = req.body || {};
  const errors = validate(body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const allowedFields = ['company', 'role', 'status', 'appliedDate'];
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      applications[index][field] = body[field];
    }
  }
  res.json(applications[index]);
});

// DELETE /api/applications/:id
router.delete('/:id', (req, res) => {
  const index = findIndexById(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  applications.splice(index, 1);
  res.status(204).send();
});

export default router;
