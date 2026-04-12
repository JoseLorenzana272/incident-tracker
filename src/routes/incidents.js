const express  = require('express');
const store    = require('../models/store');
const { authenticate, requireRole } = require('../middleware/auth');

const incidentsRouter = express.Router();
incidentsRouter.use(authenticate);

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES   = ['open', 'under_review', 'resolved', 'dismissed'];

// GET /incidents — all reporters see their own; admins see all
incidentsRouter.get('/', (req, res) => {
  let list = store.incidents;
  if (req.user.role !== 'admin') {
    list = list.filter(i => i.reportedBy === req.user.id);
  }

  const { severity, status } = req.query;
  if (severity) list = list.filter(i => i.severity === severity);
  if (status)   list = list.filter(i => i.status   === status);

  res.json({
    count: list.length,
    incidents: list.map(safeIncident),
  });
});

// GET /incidents/:id
incidentsRouter.get('/:id', (req, res) => {
  const incident = findIncident(req, res);
  if (!incident) return;
  res.json(safeIncident(incident));
});

// POST /incidents
incidentsRouter.post('/', (req, res) => {
  const { title, description, location, severity } = req.body;

  if (!title || !description || !location) {
    return res.status(400).json({ error: 'title, description, and location are required' });
  }
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    return res.status(400).json({ error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` });
  }

  const incident = {
    id: store.nextId.incident++,
    title,
    description,
    location,
    severity: severity || 'medium',
    status: 'open',
    reportedBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.incidents.push(incident);
  res.status(201).json(safeIncident(incident));
});

// PUT /incidents/:id/status — admin only
incidentsRouter.put('/:id/status', requireRole('admin'), (req, res) => {
  const incident = store.incidents.find(i => i.id === Number(req.params.id));
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const { status, notes } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  incident.status    = status;
  incident.updatedAt = new Date();
  if (notes) incident.adminNotes = notes;

  res.json({ message: 'Status updated', incident: safeIncident(incident) });
});

// Helpers
function findIncident(req, res) {
  const incident = store.incidents.find(i => i.id === Number(req.params.id));
  if (!incident) { res.status(404).json({ error: 'Incident not found' }); return null; }
  if (req.user.role !== 'admin' && incident.reportedBy !== req.user.id) {
    res.status(403).json({ error: 'Access denied' }); return null;
  }
  return incident;
}

function safeIncident(i) {
  return { id: i.id, title: i.title, description: i.description, location: i.location,
           severity: i.severity, status: i.status, createdAt: i.createdAt, updatedAt: i.updatedAt };
}

module.exports = { incidentsRouter };
